describe('Persona Analyisis Part II', () => {
    it('Persona 2. Step', () => {
        cy.DeleteSavesWithName("TEST-PERSONA VON MAX");

        cy.CreateSave("persona-2", "TEST-PERSONA VON MAX", 6).then((results) => {
            cy.InsertResource(results.insertId, "cypress/fixtures/saveData/persona-1/testpicture.png", "avatar","png")
        });

        cy.LoginAndLoad("persona");


        cy.DeleteSavesWithName("TEST-Persona VON MAX");
    });

});