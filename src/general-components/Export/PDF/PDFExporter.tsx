import {Exporter} from "../Exporter";
import {SaveResource} from "../../Datastructures";
import jsPDF from "jspdf";
import {Tools} from "../../../components/platform/home/Home";
import {ResourcesType} from "../../Tool/ToolSavePage/ResourceManager";

export interface PDFMargins {
    top: number
    right: number
    bottom: number
    left: number
}

abstract class PDFExporter<D> extends Exporter<D> {
    public height: number;
    private MARGINS = {
        top: 7,
        right: 7,
        bottom: 7,
        left: 7
    }
    private title: string = "Ihr PDF";
    private readonly fontSize: number = 12;

    public constructor(options?: {
        margins?: PDFMargins,
        defaultFontSize?: number
    }) {
        super("PDF", "pdf", "application/pdf");
        if (options) {
            if (options.margins) {
                this.MARGINS = options.margins;
            }
            if (options.defaultFontSize) {
                this.fontSize = options.defaultFontSize;
            }
        }
        this.height = 30;
    }

    public abstract buildPDF(doc: jsPDF, save: SaveResource<D>, resources: ResourcesType): Promise<void>;

    public onExport = async (save: SaveResource<D>, resources: ResourcesType): Promise<BlobPart[]> => {
        let doc = new jsPDF({
            compress: true
        });

        // Set default settings
        doc.setLanguage("de-DE");
        doc.setTextColor(0, 0, 0, 0.9);
        doc.setFontSize(this.fontSize);
        doc.setFont("Helvetica");

        await this.buildPDF(doc, save, resources);
        doc = this.addPDFStandardLook(doc, save);

        return [doc.output("blob")];
    }

    protected calculateImageHeight(doc: jsPDF) {
        return this.height;
    }

    protected addHeightPadding(padding: number) {
        this.height += padding;
    }

    protected calculateTextHeight(doc: jsPDF, text: string, fontSize?: number, multiply?: number) {
        let add = doc.getTextDimensions(text, {fontSize: fontSize ?? this.fontSize}).h;
        if (multiply) {
            add *= multiply;
        }
        this.height += add;
        return this.height;
    }

    protected getWidth(doc: jsPDF, w: number): number {
        let {width} = doc.internal.pageSize;
        return Math.min(width - this.MARGINS.right, w + this.MARGINS.left);
    }

    protected async getImageSizes(blob: Blob, maxHeight?: number, maxWidth?: number) {
        let bmap = await createImageBitmap(blob);
        let {width, height} = bmap;
        bmap.close();

        if (maxHeight && height > maxHeight) {
            let wRatio = width / height;
            height = Math.min(maxHeight, height);
            width = height * wRatio;
        }
        if (maxWidth && width > maxWidth) {
            let hRatio = height / width;
            width = Math.min(maxWidth, width);
            height = width * hRatio;
        }

        return {
            width: width,
            height: height
        }
    }

    protected setTitle(title: string) {
        this.title = title;
    }

    private addPDFStandardLook(doc: jsPDF, save: SaveResource<D>): jsPDF {
        let {width, height} = doc.internal.pageSize;
        let pageCount = doc.getNumberOfPages();

        doc.setTextColor(0, 0, 0, 0.75);
        doc.setFontSize(10);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);

            // Fußzeile
            let pageText = `Seite ${i} von ${pageCount}`;
            doc.text(
                pageText,
                width - doc.getTextDimensions(pageText, {fontSize: 10}).w - this.MARGINS.right,
                height - doc.getTextDimensions(pageText, {fontSize: 10}).h,
                {
                    baseline: "bottom"
                }
            );

            let linkText = "Erstellt mit dem Strategienavigator";
            doc.textWithLink(
                linkText,
                this.MARGINS.left,
                height - doc.getTextDimensions(linkText, {fontSize: 10}).h,
                {
                    baseline: "bottom",
                    url: 'https://strategie-navigator.jade-hs.de/'
                }
            );

            // Kopfzeile
            // Tool-name
            let toolname = `${Tools.find(v => v.id === save.tool_id)?.name ?? "Analyse"}`;
            doc.text(
                toolname,
                this.MARGINS.left,
                this.MARGINS.top,
                {
                    baseline: "top"
                }
            );

            // Save-name
            let savename = `${save.name}`;
            doc.text(
                savename,
                (width / 2) - (doc.getTextWidth(savename) / 2) - this.MARGINS.right + this.MARGINS.left,
                this.MARGINS.top,
                {
                    baseline: "top"
                }
            );
            // Datum
            let date = new Date().toLocaleDateString("de-DE");
            doc.text(
                date,
                width - doc.getTextWidth(date) - this.MARGINS.right,
                this.MARGINS.top,
                {
                    baseline: "top"
                }
            );
        }

        let h = this.MARGINS.top + 13;
        // Füge Titel hinzu
        doc.setTextColor(0, 0, 0, 0.9);
        doc.setFontSize(16);
        doc.setFont("Helvetica", "bold");

        doc.setPage(1);
        doc.text(
            this.title,
            this.MARGINS.left,
            h,
        );
        doc.setFont("Helvetica", "normal");
        h += doc.getTextDimensions(this.title, {fontSize: 16}).h;

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0, 0.5);
        doc.line(
            this.MARGINS.left,
            h,
            width - this.MARGINS.right,
            h,
            "S"
        );
        doc.setTextColor(0, 0, 0, 0.9);
        return doc;
    }

}

export {
    PDFExporter
}