import {PDFExporter} from "../../../../general-components/Export/PDF/PDFExporter";
import {PersonaAnalysisValues} from "../PersonaAnalysis";
import {SaveResource} from "../../../../general-components/Datastructures";
import {SingleMessageProps} from "../../../../general-components/Messages/Messages";
import jsPDF from "jspdf";
import {Buffer} from 'buffer';
import {ResourcesType} from "../../../../general-components/Tool/ToolSavePage/ResourceManager";
import {PersonaPersonalityComponent} from "../steps/PersonaPersonality/PersonaPersonalityComponent";
import {PersonaSummaryItem} from "../steps/PersonaSummary/PersonaSummaryComponent";


class PersonaPDFExporter extends PDFExporter<PersonaAnalysisValues> {

    buildPDF = async (doc: jsPDF, save: SaveResource<PersonaAnalysisValues>, resources: ResourcesType): Promise<void> => {
        let infos = save.data["persona-info"]!;
        let personality = save.data["persona-personality"]!;

        this.setTitle(`Persona: ${infos!.firstname}`);

        let avatar = resources.get("avatar")!;
        let avatarSizes = await this.getImageSizes(avatar.file, 60, 80);

        doc.addImage({
            imageData: new Buffer(await avatar.file.arrayBuffer()).toString("base64"),
            width: avatarSizes.width,
            height: avatarSizes.height,
            format: "JPEG",
            x: this.getWidth(doc, 0),
            y: this.calculateImageHeight(doc)
        });

        let padding = 4.5;

        // Main info
        let sizes = this.addNameValuePairs(doc, "Persona erstellt am:", [`${new Date(save.created_at).toLocaleString("de-DE")} Uhr`], avatarSizes.width + 7, this.height, padding);
        this.addNameValuePairs(doc, "Erstellt von:", [save.owner.username], this.getWidth(doc, sizes.width), undefined, 3);

        // Persona info
        this.addNameValuePairs(doc, "Name:", [infos.firstname!], avatarSizes.width + 7, undefined, padding)
        this.addNameValuePairs(doc, "Alter:", [`${infos.age} ${infos.age! === 1 ? "Jahr" : "Jahre"} alt`], avatarSizes.width + 7, undefined, padding);

        // Personalität
        let items: PersonaSummaryItem[] = [
            ...Object.values(personality.fields).map<PersonaSummaryItem>((data, index) => {
                return {
                    name: PersonaPersonalityComponent.names[index],
                    fields: data,
                    icon: PersonaPersonalityComponent.icons[index]
                };
            }),
            ...personality.individual,
            ...Object.values(personality.fieldsElse).map<PersonaSummaryItem>((data, index) => {
                let l = Object.keys(personality.fields).length;
                return {
                    name: PersonaPersonalityComponent.names[l + index],
                    fields: data,
                    icon: PersonaPersonalityComponent.icons[l + index]
                };
            })
        ];

        this.height = 96;
        for (let i = 0; i < items.length; i += 2) {
            let item = items[i];

            // Leftitem
            sizes = this.addNameValuePairs(doc, item.name, item.fields.map(i => {
                return i.name + (i.desc !== "" ? (": " + i.desc) : "");
            }), 0, this.height, padding, true);

            if (i + 1 < items.length) {
                item = items[i + 1]
                // Rightitem
                let sizesB = this.addNameValuePairs(doc, item.name, item.fields.map(i => {
                    return i.name + (i.desc !== "" ? (": " + i.desc) : "");
                }), this.getWidth(doc, sizes.width), this.height, padding, true);

                if (sizes.height > sizesB.height) {
                    this.height += sizes.height;
                } else {
                    this.height += sizesB.height;
                }
            }
        }
    }

    public validateExport(save: SaveResource<PersonaAnalysisValues>): SingleMessageProps[] {
        let errors: SingleMessageProps[] = [];
        if (save.data["persona-summary"] === undefined) {
            errors.push({
                content: "Bitte stellen Sie Ihr Persona erst fertig!",
                type: "DANGER"
            });
        }
        return errors;
    }

    private addNameValuePairs(doc: jsPDF, name: string, values: string[], width: number, useHeight?: number, heightPadding?: number, useMinus?: boolean) {
        if (values.length === 0) {
            values.push("Keine angaben");
        }

        let newWidth: number;
        let newHeight = 0;
        let height = 0;

        let breaken = this.breakStringByLength(name);
        let v = breaken.value;

        if (useHeight) {
            height = useHeight + doc.getTextDimensions(v, {fontSize: 13}).h;
            newHeight = doc.getTextDimensions(v, {fontSize: 13}).h;
        } else {
            height = this.calculateTextHeight(doc, v, 13);
            newHeight = height;
        }

        // Name
        newWidth = this.getWidth(doc, width);
        doc.setFontSize(12);
        doc.setFont("Helvetica", "bold");

        doc.text(
            v,
            newWidth,
            height
        );
        doc.setFont("Helvetica", "normal");

        let add = doc.getTextDimensions(v, {fontSize: 11}).h * (breaken.count - 1);
        let m = Math.pow(1.25, (breaken.count - 1));
        height += add * m;
        newHeight += add * m;

        // Value
        let hightestWidth = doc.getTextDimensions(breaken.longest, {fontSize: 12}).w;
        let lastLength = breaken.longest.length;

        doc.setFontSize(11);
        values.forEach((v) => {
            if (useMinus) {
                v = `- ${v}`;
            }
            let breaked = this.breakStringByLength(v);
            v = breaked.value;

            if (useHeight) {
                let add = doc.getTextDimensions(v, {fontSize: 11}).h;
                height += add;
                newHeight += add;
            } else {
                height = this.calculateTextHeight(doc, v, 11);
            }

            if (breaked.longest.length > lastLength) {
                hightestWidth = doc.getTextDimensions(breaked.longest, {fontSize: 11}).w;
                lastLength = breaked.longest.length;
            }

            doc.text(
                v,
                this.getWidth(doc, width),
                height
            );
            let add = doc.getTextDimensions(v, {fontSize: 11}).h * (breaked.count - 1);
            let m = Math.pow(1.25, (breaked.count - 1));
            height += add * m;
            newHeight += add * m;
        });
        newWidth += hightestWidth;

        if (!useHeight && heightPadding) {
            this.addHeightPadding(heightPadding);
            height += heightPadding;
        }
        if (heightPadding) {
            newHeight += heightPadding;
        }

        return {
            width: newWidth,
            height: newHeight
        };
    }

    private breakStringByLength(v: string) {
        let splitLength = 39;
        let splitO = v.split(" ");
        let splitted = [];

        let a = [];
        let l = 0;
        let longest = "";

        for (const el of splitO) {
            l += el.length + 1;
            a.push(el);

            if (l > splitLength) {
                splitted.push([...a]);

                if (a.join(" ").length > longest.length) {
                    longest = a.join(" ");
                }

                a = [];
                l = 0;
            }
        }
        if (a.length > 0) {
            splitted.push(a);
        }
        if (longest === "") {
            longest = v;
        }
        // console.log({
        //     splitted: splitted,
        //     value: splitted.map(i => i.join(" ") + "\n").join(" "),
        //     longest: longest,
        //     count: splitted.length
        // });

        return {
            value: splitted.map(i => i.join(" ") + "\n").join(" "),
            longest: longest,
            count: splitted.length
        };
    }
}

export {
    PersonaPDFExporter
}