describe('Persona Analyisis Part I', () => {
    it('trys to create a new persona as anonymous', () => {
        cy.DeleteSavesWithName( "TEST-PERSONA");
        cy.visit('/');
        cy.visitSite("/persona-analysis", "Persona Analyse");
        
        cy.intercept('POST', /.*api\/users.*/).as('anonym');
        
        cy.contains("Annehmen")
        .click();
        cy.wait("@anonym");
        
        cy.get("@anonym")
        .its("response")
        .should('include',
            {
                statusCode: 201
            });
        
        cy.intercept('GET', /.*api\/settings.*/).as('buildup');
        
        cy.url().should("include", "persona-analysis");
        cy.wait("@buildup");
        
        cy.contains("Neue Analyse")
        .click();
        cy.url().should("include", "persona-analysis/new");
        
        cy.get("input[id='name']").clear();
        cy.get("input[id='name']").type("TEST-PERSONA");

        cy.get("textarea[id='description']")
        .clear();
        cy.get("textarea[id='description']")
        .type("TEST-PERSONA ist ein Testscenario");
        
        cy.intercept('POST', /.*api\/saves.*/).as('save');
        cy.get('button[type="submit"]')
        .click();
        cy.wait("@save");
        cy.get("@save")
        .its("response")
        .should('include',
            {
                statusCode: 201
            });
        cy.log("new Persona created and saved for anonymous");
        cy.DeleteSavesWithName( "TEST-PERSONA");

    });
    
    it('trys to create a new Persona as max@test.test', () => {

        cy.DeleteSavesWithName("TEST-Persona VON MAX")

        cy.visit("/")
        cy.loginViaApi()
        cy.visit("/persona-analysis")
        cy.url().should("include", "persona-analysis")
        
        cy.contains("Neue Analyse")
        .click()
        cy.url().should("include", "persona-analysis/new")
        
        cy.get("input[id='name']")
        .type("TEST-Persona VON MAX");
        cy.get("textarea[id='description']")
        .type("TEST-Persona ist ein Testscenario von einem API eingeloggten benutzer");
        
        cy.intercept('POST', /.*api\/saves.*/).as('save')
        cy.get('button[type="submit"]')
        .click();
        cy.wait("@save")
        cy.get("@save")
        .its("response")
        .should('include',
            {
                statusCode: 201
            });
        
        cy.log("new Persona created and saved for max@test.test");

        cy.DeleteSavesWithName("TEST-Persona VON MAX");
    });
    
    it('Persona 1. Step', () => {
        cy.DeleteSavesWithName("TEST-PERSONA VON MAX");

        cy.CreateSave("persona-1", "TEST-PERSONA VON MAX", 6);
        cy.LoginAndLoad("persona");

        cy.contains("Vorname").siblings("input").as("nameInput")
            .type("MaxName");
        cy.contains("Alter").siblings("input").as("ageInput")
            .type("12");

        cy.contains("Kein Bild ausgewählt");

        cy.fixture("saveData/persona-1/testpicture",null).as("testPicture");

        cy.contains("foto").parent().find("input").as("pictureInput")
            .selectFile("@testPicture");

        cy.get("@nameInput").should("have.value","MaxName");
        cy.get("@ageInput").should("have.value","12");
        cy.get("img.avatar").should("be.visible");

        // cy.DeleteSavesWithName("TEST-Persona VON MAX");
    });
    
})



