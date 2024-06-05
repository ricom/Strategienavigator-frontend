/**
 * Dieses Enum repräsentiert eine Permission für einen SharedSave
 */
export enum SharedSavePermission {
    /**
     * Der Speicherstand kann nur gelesen werden
     * @type {SharedSavePermission.READ}
     */
    READ = 0,
    /**
     * Der Speicherstand kann gelesen und beschrieben werden
     * @type {SharedSavePermission.WRITE}
     */
    WRITE = 1,
    /**
     * Der Benutzer erhält Adminrechte
     * @type {SharedSavePermission.ADMIN}
     */
    ADMIN = 2,
    /**
     * Der Speicherstand gehört dem Besitzer
     * @type {SharedSavePermission.OWNER}
     */
    OWNER = 3
}

export const SharedSavePermissionDefault = SharedSavePermission.OWNER;

/**
 * Repräsentiert eine Resource in einem Save
 */
export interface SaveResourceResource {
    id: number,
    name: string,
    type: string,
    hash: string,
    hash_function: string
}

/**
 * Repräsentiert einen Speicherstand.
 * Der Typparameter steht für die Daten, da diese von Tool zu Tool unterschiedlich sind
 */
export interface SaveResource<D = object> extends SimpleSaveResource {
    /**
     * Data des Speicherstands
     */
    data: D,
    /**
     * Alle Kollaborateure
     */
    contributors: SimplestUserResource[],
    /**
     * Alle eingeladenen Benutzer
     */
    invited: SimplestUserResource[]
}

/**
 * Repräsentiert einen Speicherstand, aber ohne unnötige Informationen, welche so groß sein können, dass eine Schnelle Datenermittlung nicht möglich sein kann (bsp. Data)
 */
export type SimpleSaveResource = {
    /**
     * Die ID des Speicherstands
     */
    id: number
    /**
     * Die ID des Benutzers der aktuell den Speicherstand bearbeitet. Sollte keiner diesen bearbeiten steht hier null
     */
    locked_by: number
    /**
     * Wann der Speicherstand zuletzt geöffnet wurde
     */
    last_opened: string
    /**
     * Der Name des Speicherstands
     */
    name: string
    /**
     * Der Zeitstempel wann der Speicherstand das letzte mal bearbeitet wurde
     */
    last_locked: string
    /**
     * name des Eigentümers
     */
    owner: SimplestUserResource
    /**
     * ob das Konto des Eigentümers gerade gelöscht wird
     */
    owner_deleting: boolean
    /**
     * Die ID des dazugehörigen Tools
     */
    tool_id: number
    /**
     * Die Beschreibung des Speicherstands
     */
    description: string
    /**
     * Wann erstellt?
     */
    created_at: string,
    /**
     * Zuletzt bearbeitet
     */
    updated_at: string
    /**
     * Die Berechtigung der Einladung
     */
    permission?: {
        /**
         * Die Berechtigung die die Person erhält, sollte diese die Einladung akzeptieren.
         * Die Berechtigung wird mittels Integer angegeben
         */
        permission: SharedSavePermission
        /**
         * Das Datum wann die Einladung erfolgte
         */
        created_at: string
    }
    /**
     * Alle Ressourcen assoziert mit dem Save
     */
    resources: SaveResourceResource[]
}

export type SimpleSaveResourceLastOpened = SimpleSaveResource & {last_opened_by_user: string}

/**
 * Eine Einladung zu einem Speicherstand
 */
export type InvitationLinkResource = {
    /**
     * Das Datum wann die Einladung ausläuft
     */
    expiry_date: string
    /**
     * Die Berechtigung die die Person erhält, sollte diese die Einladung akzeptieren.
     * Die Berechtigung wird mittels Integer angegeben
     */
    permission: SharedSavePermission
    /**
     * Das Datum wann die Einladung erfolgte
     */
    created_at: string
    /**
     * Die ID des Speicherstands, zu dem der Benutzer eingeladen wurde
     */
    save: SimplerSaveResource
    /**
     * Der Token des Einladungslinks
     */
    token: string
}

export type SimplerSaveResource = {
    /**
     * Die ID des Saves
     */
    id: number,
    /**
     * Die Bezeichnung des Saves
     */
    name: string,
    /**
     * Der Inhaber des Saves
     */
    owner: SimplestUserResource,
    /**
     * Das Tool des Saves
     */
    tool: ToolResource
}

/**
 * Datenressource einer Passwort zurücksetzung
 */
export type PasswordResetResource = {
    /**
     * Die ID des Benutzers, zu dem der Password-reset gehört
     */
    user_id: number
    /**
     * Das Datum, wann der Password-reset ausläuft
     */
    expiry_date: string
}

/**
 * Datenressource eines Benutzers im simpelsten Zustand
 */
export type SimplestUserResource = {
    /**
     * Die ID des Benutzers
     */
    id: number,
    /**
     * Der Benutzername des Benutzers
     */
    username: string
}

/**
 * Sollte eine Abfrage stattfinden, wo eine Pagination eingebunden ist, wird diese hier dargestellt.
 * Der Typparameter D repräsentiert die in der Pagination eingebundende Ressource. Dabei kann es sich z.B. um einen Speicherstand oder Benutzer handeln.
 */
export type PaginationResource<D> = {
    /**
     * Die Daten der Pagination. Enthält alle Ressourcen vom Typ D als Array.
     */
    data: Array<D>
    /**
     * Stellt die Links dar welche angeklickt werden müssen, um sich die erste, letzte, nächste und vorherige Ressource anzeigen zu lassen.
     * Im falle einer API-Abfrage stellen die Links hier die Nächste API-Anfrage dar.
     */
    links: {
        first: string | null
        last: string | null
        prev: string | null
        next: string | null
    }
    /**
     * Metadaten der Pagination
     */
    meta: {
        current_page: number
        from: number
        last_page: number
        links: Array<{
            url: string | null
            label: string | null
            active: boolean
        }>
        path: string
        per_page: number
        to: number
        total: number
    }
}

export type DefaultResponse<D> = {
    /**
     * Daten
     */
    data: D
}

export type UserResource = {
    /**
     * ID des Benutzers
     */
    id: number
    /**
     * Benutzername
     */
    username: string
    /**
     * Boolean Flag ob es sich um einen Anonymen Benutzer handelt
     */
    anonymous: boolean
    /**
     * E-Mail Adresse des Benutzers
     */
    email: string
    /**
     * Erstelldatum des Benutzerkontos
     */
    created_at: string
    /**
     * Array mit der IDs der von diesem Benutzer erstellten Speicherstände
     */
    owned_saves: Array<SimplerSaveResource>
    /**
     * Array mit IDs der mit diesem Benutzer geteilten Speicherstände
     */
    shared_saves: Array<SharedSaveUserResource>
    /**
     * Array mit Einladungen an diesen Benutzer
     */
    invitations: Array<SharedSaveUserResource>
}

export type AnonymousUserResource = {
    /**
     * Benutzername des Anonymen Benutzers
     */
    username: string,
    /**
     * Passwort des Anonymen Benutzers
     */
    password: string
}

export type TokenCreatedResource = {
    /**
     * Type des Tokens, normalerweise "Bearer"
     */
    token_type: string
    /**
     * Zeit in sekunden, nachdem der Token abläuft
     */
    expires_in: number
    /**
     * Der Access Token
     */
    access_token: string
    /**
     * Der Refresh Token
     */
    refresh_token: string
}

export type ToolResource = {
    /**
     * ID des Tools
     */
    id: number
    /**
     * Name des Tools
     */
    name: string
}

export type SharedSaveResource = {
    /**
     * ID in der Datenbank
     */
    id: number
    /**
     * ID des eingeladenen Benutzers
     */
    user: SimplestUserResource
    /**
     * ID des geteilten Speicherstandes
     */
    save: SimplerSaveResource
    /**
     * Die Berechtigung die der eingeladene Benutzer erhält
     */
    permission: SharedSavePermission
    /**
     * Das Datum wann die Einladung erfolgte
     */
    created_at: string
    /**
     * Boolean ob die Einladung angenommen wurde
     */
    accepted: boolean
    /**
     * Boolean ob die Einladung abgelehnt wurde
     */
    declined: boolean
    /**
     * Boolean ob die Einladung zurückgezogen wurde
     */
    revoked: boolean
}

export type SharedSaveUserResource = {
    /**
     * Der Speicherstand
     */
    save: SimplerSaveResource
    /**
     * Berechtigung für den Speicherstand
     */
    permission: SharedSavePermission
    /**
     * Das Datum wann die Einladung erfolgte
     */
    created_at: string
}

export type AvailabilityCheckResource = {
    /**
     * ob das eingegebene noch verfügbar ist
     */
    available: boolean,

    /**
     * Grund für Verfügbarkeitsstatus
     *
     * string ist leer, wenn verfügbar
     */
    reason: "taken" | "blocked" | "invalid",
}
export type UserSettingResource = {
    /**
     * ID des Benutzers
     */
    user_id: number
    /**
     * ID der Einstellung
     */
    setting_id: number
    /**
     * Wert der Einstellung
     */
    value: string
}

export type UserSearchResultResource = SimplestUserResource;

export type SettingResource = {
    /**
     * ID der Einstellung
     */
    id: number
    /**
     * Name der Einstellung
     */
    name: string
    /**
     * Beschreibung der Einstellung
     */
    description: string
    /**
     * Art der Einstellung
     */
    type: string
    /**
     * Sonstige Extrainformationen welche mitgespeichert werden können.
     */
    extras: string
    /**
     * Der Standardwert der Einstellung
     */
    default: string
}


export interface CaptchaResponse {
    /**
     * Ob das Captcha case sensitive ist
     */
    sensitive: boolean,
    /**
     * Der Key des Captchas
     */
    key: string,
    /**
     * Die Bilddaten des Captchas
     */
    img: string
}

export interface ImportJSONDataInterface {
    /**
     * Enthalten alle Export-Resourcen beim JSON-Export mit name und Blob
     */
    "export-resources": ImportJSONData[]
}

export type ImportJSONData = {
    file: string,
    name: string,
    type: string
};
