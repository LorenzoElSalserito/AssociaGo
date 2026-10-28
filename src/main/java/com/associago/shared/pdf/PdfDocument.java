package com.associago.shared.pdf;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.Closeable;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * Flowing A4 layout over PDFBox: a cursor moving down the page, automatic page breaks,
 * a header repeated on every page and a footer painted once all pages exist.
 * Every string is passed through {@link PdfText#sanitize} before it reaches the content stream.
 */
public final class PdfDocument implements Closeable {

    public static final float MARGIN = 50;
    private static final float BOTTOM = 60;
    public static final Color MUTED = new Color(100, 100, 100);

    public final PDFont regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    public final PDFont bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    public final PDFont italic = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

    @FunctionalInterface
    public interface Painter {
        void paint(PdfDocument pdf) throws IOException;
    }

    @FunctionalInterface
    public interface FooterPainter {
        void paint(PdfDocument pdf, int pageNumber, int pageCount) throws IOException;
    }

    /** A signer drawn by {@link #signatures}: the image (may be null or corrupt) sits above name and role. */
    public record SignatureBlock(String name, String role, byte[] image) {}

    private final PDDocument document = new PDDocument();
    private final PDRectangle size;
    private final Painter header;
    private PDPageContentStream stream;
    private float y;

    public PdfDocument(PDRectangle size, Painter header) throws IOException {
        this.size = size;
        this.header = header;
        newPage();
    }

    public PDDocument document() { return document; }
    public PDPageContentStream stream() { return stream; }
    public float width() { return size.getWidth(); }
    public float height() { return size.getHeight(); }
    public float left() { return MARGIN; }
    public float right() { return size.getWidth() - MARGIN; }
    public float contentWidth() { return right() - left(); }
    public float y() { return y; }
    public void moveTo(float newY) { y = newY; }
    public void space(float amount) { y -= amount; }

    public void newPage() throws IOException {
        if (stream != null) stream.close();
        PDPage page = new PDPage(size);
        document.addPage(page);
        stream = new PDPageContentStream(document, page);
        y = size.getHeight() - MARGIN;
        if (header != null) header.paint(this);
    }

    /** Starts a new page unless {@code needed} points still fit above the bottom margin. */
    public void ensureSpace(float needed) throws IOException {
        if (y - needed < BOTTOM) newPage();
    }

    // --- Primitives (absolute position, no cursor movement) ---

    public void text(float x, float baseline, String text, PDFont font, float fontSize) throws IOException {
        text(x, baseline, text, font, fontSize, Color.BLACK);
    }

    public void text(float x, float baseline, String text, PDFont font, float fontSize, Color color) throws IOException {
        String safe = PdfText.sanitize(text);
        if (safe.isEmpty()) return;
        stream.beginText();
        stream.setNonStrokingColor(color);
        stream.setFont(font, fontSize);
        stream.newLineAtOffset(x, baseline);
        stream.showText(safe);
        stream.endText();
        stream.setNonStrokingColor(Color.BLACK);
    }

    public void textRight(float rightEdge, float baseline, String text, PDFont font, float fontSize) throws IOException {
        text(rightEdge - textWidth(text, font, fontSize), baseline, text, font, fontSize);
    }

    public void textCentered(float centerX, float baseline, String text, PDFont font, float fontSize) throws IOException {
        text(centerX - textWidth(text, font, fontSize) / 2, baseline, text, font, fontSize);
    }

    public float textWidth(String text, PDFont font, float fontSize) throws IOException {
        return font.getStringWidth(PdfText.sanitize(text)) / 1000 * fontSize;
    }

    /** Shortens text with an ellipsis so it fits in {@code maxWidth}. */
    public String fit(String text, PDFont font, float fontSize, float maxWidth) throws IOException {
        String safe = PdfText.sanitize(text);
        if (textWidth(safe, font, fontSize) <= maxWidth) return safe;
        String ellipsis = "…";
        int end = safe.length();
        while (end > 0 && textWidth(safe.substring(0, end) + ellipsis, font, fontSize) > maxWidth) end--;
        return safe.substring(0, end).stripTrailing() + ellipsis;
    }

    public void hLine(float x1, float x2, float atY, Color color) throws IOException {
        stream.setStrokingColor(color);
        stream.setLineWidth(0.5f);
        stream.moveTo(x1, atY);
        stream.lineTo(x2, atY);
        stream.stroke();
        stream.setStrokingColor(Color.BLACK);
    }

    /** Draws an image scaled into the box, aspect preserved and bottom-centred; false if it cannot be decoded. */
    public boolean image(byte[] bytes, String name, float x, float bottom, float maxWidth, float maxHeight) {
        if (bytes == null || bytes.length == 0) return false;
        try {
            PDImageXObject image = PDImageXObject.createFromByteArray(document, bytes, name);
            if (image.getWidth() <= 0 || image.getHeight() <= 0) return false;
            float scale = Math.min(maxWidth / image.getWidth(), maxHeight / image.getHeight());
            float w = image.getWidth() * scale;
            float h = image.getHeight() * scale;
            stream.drawImage(image, x + (maxWidth - w) / 2, bottom, w, h);
            return true;
        } catch (Exception | LinkageError e) {
            return false;
        }
    }

    // --- Flowing content (advances the cursor) ---

    public void heading(String text, float fontSize) throws IOException {
        ensureSpace(fontSize * 2);
        y -= fontSize;
        text(left(), y, text, bold, fontSize);
        y -= fontSize * 0.8f;
    }

    public void line(String text, PDFont font, float fontSize) throws IOException {
        line(left(), text, font, fontSize);
    }

    public void line(float x, String text, PDFont font, float fontSize) throws IOException {
        ensureSpace(fontSize * 1.5f);
        y -= fontSize * 1.45f;
        text(x, y, fit(text, font, fontSize, right() - x), font, fontSize);
    }

    /** "Label: value" with a bold label. */
    public void field(String label, String value) throws IOException {
        ensureSpace(17);
        y -= 16;
        String prefix = PdfText.sanitize(label) + ": ";
        text(left(), y, prefix, bold, 11);
        float offset = textWidth(prefix, bold, 11);
        text(left() + offset, y, fit(value, regular, 11, contentWidth() - offset), regular, 11);
    }

    /** Word-wrapped paragraph starting at {@code x}. */
    public void paragraph(float x, String text, PDFont font, float fontSize) throws IOException {
        for (String row : wrap(text, font, fontSize, right() - x)) {
            line(x, row, font, fontSize);
        }
    }

    public List<String> wrap(String text, PDFont font, float fontSize, float maxWidth) throws IOException {
        List<String> rows = new ArrayList<>();
        for (String paragraph : (text == null ? "" : text).split("\\r?\\n")) {
            StringBuilder current = new StringBuilder();
            for (String word : PdfText.sanitize(paragraph).trim().split(" +")) {
                if (word.isEmpty()) continue;
                word = fit(word, font, fontSize, maxWidth);
                if (current.isEmpty()) {
                    current.append(word);
                } else if (textWidth(current + " " + word, font, fontSize) <= maxWidth) {
                    current.append(' ').append(word);
                } else {
                    rows.add(current.toString());
                    current = new StringBuilder(word);
                }
            }
            if (!current.isEmpty()) rows.add(current.toString());
        }
        return rows;
    }

    /** One table row; each cell is clipped to its column. {@code alignRight} marks numeric columns. */
    public void row(float[] columns, String[] cells, boolean[] alignRight, PDFont font, float fontSize) throws IOException {
        ensureSpace(fontSize * 1.6f);
        y -= fontSize * 1.5f;
        for (int i = 0; i < cells.length; i++) {
            float start = columns[i];
            float end = i + 1 < columns.length ? columns[i + 1] - 6 : right();
            String cell = fit(cells[i], font, fontSize, end - start);
            if (alignRight != null && alignRight[i]) textRight(end, y, cell, font, fontSize);
            else text(start, y, cell, font, fontSize);
        }
    }

    public void rule() throws IOException {
        ensureSpace(8);
        y -= 4;
        hLine(left(), right(), y, Color.LIGHT_GRAY);
        y -= 4;
    }

    /**
     * Signature blocks side by side: image (scaled, aspect preserved) above a line, then name and role.
     * A missing or unreadable image leaves the line blank for a handwritten signature.
     */
    public void signatures(String heading, List<SignatureBlock> signers) throws IOException {
        if (signers.isEmpty()) return;
        float imageHeight = 45;
        ensureSpace(imageHeight + 70);
        if (heading != null) {
            y -= 14;
            text(left(), y, heading, bold, 11);
        }
        y -= 12 + imageHeight;
        int perRow = Math.min(signers.size(), 3);
        float columnWidth = contentWidth() / perRow;
        float lineY = y;
        for (int i = 0; i < signers.size(); i++) {
            if (i > 0 && i % perRow == 0) {
                y -= 50;
                ensureSpace(imageHeight + 40);
                y -= imageHeight;
                lineY = y;
            }
            SignatureBlock signer = signers.get(i);
            float x = left() + (i % perRow) * columnWidth + 10;
            float width = columnWidth - 20;
            image(signer.image(), "signature-" + i, x, lineY + 2, width, imageHeight);
            hLine(x, x + width, lineY, Color.GRAY);
            float center = x + width / 2;
            textCentered(center, lineY - 12, fit(signer.name(), regular, 10, width), regular, 10);
            textCentered(center, lineY - 24, fit(signer.role(), italic, 9, width), italic, 9, MUTED);
        }
        y = lineY - 34;
    }

    private void textCentered(float centerX, float baseline, String text, PDFont font, float fontSize, Color color) throws IOException {
        text(centerX - textWidth(text, font, fontSize) / 2, baseline, text, font, fontSize, color);
    }

    /** Closes the last page, paints the footer on each page and returns the PDF bytes. */
    public byte[] finish(FooterPainter footer) throws IOException {
        stream.close();
        stream = null;
        int count = document.getNumberOfPages();
        if (footer != null) {
            for (int i = 0; i < count; i++) {
                stream = new PDPageContentStream(document, document.getPage(i), PDPageContentStream.AppendMode.APPEND, true, true);
                footer.paint(this, i + 1, count);
                stream.close();
            }
            stream = null;
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        document.save(out);
        return out.toByteArray();
    }

    @Override
    public void close() throws IOException {
        if (stream != null) stream.close();
        document.close();
    }
}
