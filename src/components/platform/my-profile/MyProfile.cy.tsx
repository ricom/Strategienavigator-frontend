import {mount} from "cypress/react18"
import '../../../index.scss'
import {MyProfile} from "./MyProfile";
import {MemoryRouter} from "react-router";
import {UserContextComponent} from "../../../general-components/Contexts/UserContextComponent";
import {Session} from "../../../general-components/Session/Session";
import {User} from "../../../general-components/User";
import {SharedSavePermission, SimpleSaveResource} from "../../../general-components/Datastructures";

describe('MyProfile Page', () => {

    before(function () {
            Session.currentUser = new User(
                1,
                "TestUser",
                "max@test.test",
                false,
                [1],
                [2, 3],
                new Date());
        }
    )

    it("CheckLoadingBehaviour", () => {
        // mock network
        const testSave = {
            id: 1,
            name: "SaveName",
            description: "SaveBeschreibung",
            created_at: new Date().toDateString(),
            last_locked: new Date().toDateString(),
            last_opened: new Date().toDateString(),
            locked_by: Session.currentUser?.getID()!,
            owner: {
                id: 1,
                username: "TestUser"
            },
            owner_deleting: false,
            permission: {
                permission: SharedSavePermission.ADMIN,
                created_at: new Date().toDateString()
            },
            resources: [],
            tool_id: 1,
            updated_at: new Date().toDateString()
        } as SimpleSaveResource;
        cy.intercept({
            method: "GET",
            url: "**api/saves/index/last"
        }, (req) => {
            req.reply({
                data: [testSave]
            });
        }).as("stubedRequest");


        mount(<UserContextComponent><MemoryRouter><MyProfile></MyProfile></MemoryRouter></UserContextComponent>);
        cy.wait('@stubedRequest');
        cy.contains("Zuletzt geöffnet").parent().as("saveContainer");

        cy.contains("Anzahl eigener Analysen").parent().find(".badge").as('ownedCount');
        cy.contains("Anzahl geteilter Analysen").parent().find(".badge").as('sharedCount');

        cy.get('@saveContainer').contains('SaveName');
        cy.get('@ownedCount').should('have.text', 1);
        cy.get('@sharedCount').should('have.text', 2);

        cy.get('#username').should('have.value', "TestUser").should('have.attr', "readonly");
        cy.get('#email').should('have.value', "max@test.test").should('have.attr', "readonly");
    });

    it("Check edit button and page", function () {
        mount(<UserContextComponent><MemoryRouter><MyProfile></MyProfile></MemoryRouter></UserContextComponent>);

        cy.contains('Bearbeiten').click();
        cy.contains('Bearbeiten').should('not.exist');
        cy.contains('Änderungen speichern');
        cy.contains('Benutzer löschen');

        cy.get('#username').should('have.value', "TestUser").should('not.have.attr', "readonly");
        cy.get('#email').should('have.value', "max@test.test").should('not.have.attr', "readonly");

        cy.get('#new_password').type("pass").should('have.value', 'pass');
        cy.get('#new_password_confirm').clear().type("pass").should('have.value', 'pass');

        cy.get('#username').clear().type("newUsername").should('have.value', 'newUsername');
        cy.get('#email').clear().type("newUsername").should('have.value', 'newUsername');
    });

    it("Check back button", function () {
        mount(<UserContextComponent><MemoryRouter><MyProfile></MyProfile></MemoryRouter></UserContextComponent>);
        cy.get('#username').should('have.value', "TestUser").should('have.attr', "readonly");

        cy.contains('Bearbeiten').click();

        cy.get('#username').should('have.value', "TestUser").should('not.have.attr', "readonly");


        cy.get('#username').clear().type("newUsername").should('have.value', 'newUsername');
        cy.get('#email').clear().type("newUsername").should('have.value', 'newUsername');

        cy.contains('zurück', {matchCase: false}).click();

        cy.get('#username').should('have.value', "TestUser").should('have.attr', "readonly");
        cy.get('#email').should('have.value', 'max@test.test').should('have.attr', "readonly");

        cy.get('#new_password').should('not.exist');
        cy.get('#new_password_confirm').should('not.exist');
    });

    it("Test same and different Password", function () {
        mount(<UserContextComponent><MemoryRouter><MyProfile></MyProfile></MemoryRouter></UserContextComponent>);

        cy.contains('Bearbeiten').click();

        cy.get('#new_password').type('StrongPassw0rd!');
        cy.get('#new_password_confirm').type('DifferentStrongPassw0rd!');

        cy.get('#current_password').type("CurrentPass"); // only for form validation not to fail

        cy.contains('Passwörter müssen übereinstimmen');
    })
});

