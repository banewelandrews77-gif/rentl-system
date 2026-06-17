package gh.hostelconnect.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Image;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import gh.hostelconnect.domain.Reservation;
import gh.hostelconnect.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class ReceiptService {

    public ByteArrayInputStream generateReceipt(Reservation reservation) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter writer = PdfWriter.getInstance(document, out);
            
            // Set PDF Security: Allow printing, but disable editing and copying
            // We use a fixed owner password to lock the document permissions
            writer.setEncryption(null, "HOSTELCONNECT_OWNER_LOCK_2026".getBytes(), 
                PdfWriter.ALLOW_PRINTING, PdfWriter.ENCRYPTION_AES_128);

            document.open();

            // Fonts
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, Color.DARK_GRAY);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, Color.GRAY);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(180, 83, 9)); // Amber-700

            // Header - Business Identity
            Paragraph brand = new Paragraph("HostelConnect GH", titleFont);
            brand.setAlignment(Element.ALIGN_RIGHT);
            document.add(brand);

            Paragraph contact = new Paragraph("Official Payment Receipt\nContact: +233 59 593 4551\nhostelconnectgh5@gmail.com", FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY));
            contact.setAlignment(Element.ALIGN_RIGHT);
            document.add(contact);

            document.add(new Paragraph("\n"));

            // Title
            Paragraph title = new Paragraph("BOOKING RECEIPT", headerFont);
            title.setAlignment(Element.ALIGN_LEFT);
            document.add(title);
            
            document.add(new Paragraph("Reference: " + reservation.getPaymentReference(), boldFont));
            document.add(new Paragraph("Date: " + DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm").withZone(ZoneId.systemDefault()).format(reservation.getCreatedAt()), normalFont));

            document.add(new Paragraph("\n\n"));

            // Info Table (Agent & Customer)
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            
            // From (Agent)
            User agent = reservation.getHostel().getAgent().getUser();
            PdfPCell cellFrom = new PdfPCell();
            cellFrom.setBorder(Rectangle.NO_BORDER);
            cellFrom.addElement(new Paragraph("FROM (AGENT / HOSTEL)", subHeaderFont));
            cellFrom.addElement(new Paragraph(agent.getFullName(), boldFont));
            cellFrom.addElement(new Paragraph(reservation.getHostel().getName(), normalFont));
            cellFrom.addElement(new Paragraph(agent.getEmail(), normalFont));
            cellFrom.addElement(new Paragraph(agent.getPhoneNumber(), normalFont));
            infoTable.addCell(cellFrom);

            // To (Customer)
            User customer = reservation.getCustomer();
            PdfPCell cellTo = new PdfPCell();
            cellTo.setBorder(Rectangle.NO_BORDER);
            cellTo.addElement(new Paragraph("TO (CUSTOMER)", subHeaderFont));
            cellTo.addElement(new Paragraph(customer.getFullName(), boldFont));
            cellTo.addElement(new Paragraph(customer.getEmail(), normalFont));
            cellTo.addElement(new Paragraph(customer.getPhoneNumber(), normalFont));
            infoTable.addCell(cellTo);

            document.add(infoTable);
            document.add(new Paragraph("\n\n"));

            // Details Table
            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 1});

            // Table Headers
            PdfPCell h1 = new PdfPCell(new Phrase("Description", boldFont));
            h1.setBackgroundColor(new Color(245, 245, 244)); // Stone-100
            h1.setPadding(8);
            table.addCell(h1);

            PdfPCell h2 = new PdfPCell(new Phrase("Amount (GHS)", boldFont));
            h2.setBackgroundColor(new Color(245, 245, 244));
            h2.setPadding(8);
            table.addCell(h2);

            // Row 1: Hostel & Room
            table.addCell(new PdfPCell(new Phrase("Accommodation at " + reservation.getHostel().getName() + " - " + reservation.getRoomType().getName(), normalFont)));
            table.addCell(new PdfPCell(new Phrase(reservation.getAmountPaid().toString(), normalFont)));

            // Row 2: Duration
            table.addCell(new PdfPCell(new Phrase("Stay Duration: " + reservation.getStartDate() + " to " + reservation.getEndDate(), normalFont)));
            table.addCell(new PdfPCell(new Phrase("-", normalFont)));

            // Total Row
            PdfPCell totalLabel = new PdfPCell(new Phrase("TOTAL PAID", boldFont));
            totalLabel.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalLabel.setPadding(8);
            table.addCell(totalLabel);

            PdfPCell totalVal = new PdfPCell(new Phrase("GHS " + reservation.getAmountPaid().toString(), boldFont));
            totalVal.setPadding(8);
            table.addCell(totalVal);

            document.add(table);

            document.add(new Paragraph("\n\n"));
            Paragraph footer = new Paragraph("Thank you for choosing HostelConnect GH. Please present this receipt at the hostel for check-in. This is a computer-generated document and requires no signature.", FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();

        } catch (DocumentException e) {
            log.error("Error generating receipt PDF", e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
