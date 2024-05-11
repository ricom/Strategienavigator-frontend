describe('Persona Analyisis Part II', () => {
    it('Persona 2. Step', () => {
        cy.DeleteSavesWithName("TEST-PERSONA VON MAX");

        cy.CreateSave("persona-2", "TEST-PERSONA VON MAX", 6);
        // TODO upload resource
        cy.LoginAndLoad("persona");



        cy.DeleteSavesWithName("TEST-Persona VON MAX");
    });

});