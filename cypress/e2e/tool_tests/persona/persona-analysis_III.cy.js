describe('Persona Analyisis Part III', () => {
    it('Persona 3. Step', () => {
        cy.DeleteSavesWithName("TEST-PERSONA VON MAX");

        cy.CreateSave("persona-3", "TEST-PERSONA VON MAX", 6).then((results) => {
            cy.InsertResource(results.insertId, "cypress/fixtures/saveData/persona-1/testpicture.png", "avatar", "png")
        });

        cy.LoginAndLoad("persona");
        cy.get("#step-tabpane-2").as("tab");

        cy.get(".names").contains("12 Jahre alt");
        cy.get(".names").contains("Testname");

        cy.get("img.avatar").should("be.visible");

        cy.get("@tab").contains("Pains", {matchCase: true})
            .closest(".info-container").contains("pains-Value");

        cy.get("@tab").contains("Gains")
            .closest(".info-container").contains("gains-value");

        cy.get("@tab").contains("Demographische Daten")
            .closest(".info-container").contains("demographics-value");

        cy.get("@tab").contains("Statements")
            .closest(".info-container").contains("\"TestStatement-Value\"");

        cy.get("@tab").contains("Sätzen beschreiben")
            .closest(".info-container").contains("Two sentences.-Value");

        cy.get("@tab").contains("KatTest-Value")
            .closest(".info-container").contains("testKat-Value");
        cy.get("@tab").contains("Grundmotiv")
            .closest(".info-container").as("motive").contains("testMotive-Value");
        cy.get("@motive").contains("testMotive2");


        cy.DeleteSavesWithName("TEST-Persona VON MAX");
    });

});