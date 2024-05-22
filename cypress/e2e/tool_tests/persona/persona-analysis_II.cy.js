describe('Persona Analyisis Part II', () => {
    it('Persona 2. Step', () => {
        cy.DeleteSavesWithName("TEST-PERSONA VON MAX");

        cy.CreateSave("persona-2", "TEST-PERSONA VON MAX", 6).then((results) => {
            cy.InsertResource(results.insertId, "cypress/fixtures/saveData/persona-1/testpicture.png", "avatar","png")
        });

        cy.LoginAndLoad("persona");

        const headers = ["Demographische Daten","Pains","Gains","beschreiben"]
        for (const header of headers) {
            checkCategory(header);
        }

        cy.contains("Grundmotiv").parent().as("Grundmotiv").find(".addCard").click();
        cy.get("@Grundmotiv").find(".input-group > input").as("firstGrundmotiv").type("test");
        cy.get("@firstGrundmotiv").should("have.value","test");
        cy.get("@Grundmotiv").find("textarea").as("firstGrundmotivDesc").type("test2");
        cy.get("@firstGrundmotivDesc").should("have.value","test2");

        cy.contains("Statements").parent().as("Statements").find(".addCard").click();
        cy.get("@Statements").find(".input-group > input").as("firstStatement").type("test");
        cy.get("@firstStatement").should("have.value","\"test\"");


        cy.contains("Individuelle Kategorien").siblings(".addCard").click();
        cy.get("input[placeholder='Kategoriebezeichnung']").as("katName").type("KatTest");
        cy.get("@katName").should("have.value","KatTest");
        cy.get("@katName").closest("legend").siblings().find(".addCard").click();
        cy.get("@katName").closest("legend").siblings().find(".input-group > input").as("firstKat").type("testKat");
        cy.get("@firstKat").should("have.value","testKat");
        for (let i = 0; i < 4; i++) {
            cy.contains("Individuelle Kategorien").siblings(".addCard").click();
        }
        cy.contains("Individuelle Kategorien").siblings(".addCard").should("not.exist");

        cy.DeleteSavesWithName("TEST-Persona VON MAX");
    });

});

function checkCategory(header){
    cy.contains(header).parent().as(header).find('.addCard').click();
    cy.get("@"+header).find(".input-group > input").as("first"+header);
    cy.get("@"+header).find("textarea").should("not.exist");
    cy.get("@first"+header).type("test");
    cy.get("@first"+header).should("have.value","test");
}