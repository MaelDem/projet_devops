import { expect, test, describe, beforeEach, mock } from "bun:test";
import * as eventLogic from "../config/global-mocks";
import type { EventInput } from "../../types";

// 1. On définit le mock du module AVANT d'importer le repository
// On wrap les fonctions dans mock() pour pouvoir utiliser .toHaveBeenCalled()
mock.module("../../events/repository", () => ({
    getEvent: mock(eventLogic.getEvent),
    createEvent: mock(eventLogic.createEvent),
    listEvents: mock(eventLogic.listEvents),
    updateEvent: mock(eventLogic.updateEvent),
    deleteEvent: mock(eventLogic.deleteEvent),
}));

// 2. On importe le repository (qui est maintenant mocké)
import * as EventRepo from "../../events/repository";

beforeEach(() => {
    eventLogic.resetEvents();
    mock.restore(); 
});

describe("Event Repository Tests", () => {

    test("getEvent returns a specific event by ID", async () => {
        const result = await EventRepo.getEvent(1);
        
        expect(result).toBeDefined();
        expect(result?.id).toBe(1);
        expect(result?.title).toBe("Event 1");
        
        expect(EventRepo.getEvent).toHaveBeenCalledWith(1);
    });

    test("getEvent returns undefined if event not found", async () => {
        const result = await EventRepo.getEvent(999);
        expect(result).toBeUndefined();
    });

    test("createEvent creates and returns a new event", async () => {
        const newEventInput: EventInput = {
            title: "New Event",
            date: "2024-12-01T10:00:00Z",
            location: "Paris",
            max_participants: 50
        };

        const result = await EventRepo.createEvent(newEventInput);

        expect(result.id).toBe(4); // Car il y en a 3 dans le seed
        expect(result.title).toBe(newEventInput.title);
        expect(result.description).toBe(""); 
        expect(EventRepo.createEvent).toHaveBeenCalled();
    });

    test("updateEvent modifies and returns the event", async () => {
        const updateInput: EventInput = {
            title: "Updated Event 1",
            date: "2024-01-02T10:00:00Z"
        };

        const result = await EventRepo.updateEvent(1, updateInput);
        
        expect(result).toBeDefined();
        expect(result?.title).toBe("Updated Event 1");
        expect(result?.id).toBe(1);
    });

    test("deleteEvent returns true on success", async () => {
        const result = await EventRepo.deleteEvent(1);
        expect(result).toBe(true);
        
        // Vérification supplémentaire : l'événement a disparu du store
        const check = await EventRepo.getEvent(1);
        expect(check).toBeUndefined();
    });

    test("deleteEvent returns false if id does not exist", async () => {
        const result = await EventRepo.deleteEvent(999);
        expect(result).toBe(false);
    });
});