import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class InvoiceService {
  async generateInvoicePdf(order: any, payment: any): Promise<{ pdfUrl: string; pdfBuffer: Buffer }> {
    const invoicesDir = path.join(process.cwd(), 'public', 'invoices');
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${order.id.substring(0, 8).toUpperCase()}`;
    const filename = `invoice-${order.id}.pdf`;
    const filePath = path.join(invoicesDir, filename);

    // Initialize PDF document
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk) => buffers.push(chunk));

    const endPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Colors
    const orangeColor = '#F97316';
    const blackColor = '#1F2937';
    const grayColor = '#6B7280';

    // Header Logo and Branding
    doc.fillColor(orangeColor).fontSize(22).text('FOODFLOW', 50, 50, { align: 'left' });
    doc.fillColor(grayColor).fontSize(9).text('Enterprise Multi-Vendor Commerce Platform', 50, 75);

    doc.fillColor(blackColor).fontSize(20).text('INVOICE', 400, 50, { align: 'right' });
    doc.fillColor(grayColor).fontSize(9).text(`#${invoiceNumber}`, 400, 75, { align: 'right' });

    doc.moveTo(50, 100).lineTo(550, 100).strokeColor('#E5E7EB').stroke();

    // Bill To & From
    doc.fillColor(blackColor).fontSize(11).text('BILL TO:', 50, 120);
    doc.fillColor(blackColor).fontSize(10).text(order.user.name, 50, 135);
    doc.fillColor(grayColor).fontSize(9).text(order.user.email, 50, 150);
    const addr = order.address;
    const addrStr = `${addr.houseNumber} ${addr.buildingName || ''}, ${addr.area}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
    doc.fillColor(grayColor).fontSize(9).text(addrStr, 50, 165, { width: 220 });

    doc.fillColor(blackColor).fontSize(11).text('RESTAURANT:', 300, 120);
    doc.fillColor(blackColor).fontSize(10).text(order.restaurant?.name || 'FoodFlow Kitchen', 300, 135);
    doc.fillColor(grayColor).fontSize(9).text(order.restaurant?.address || 'FoodFlow Hub, Kozhikode', 300, 150, { width: 250 });

    doc.moveTo(50, 220).lineTo(550, 220).strokeColor('#E5E7EB').stroke();

    // Invoice Date & Payment details
    doc.fillColor(grayColor).fontSize(9).text('Invoice Date:', 50, 235);
    doc.fillColor(blackColor).fontSize(9).text(new Date(order.createdAt).toLocaleDateString(), 120, 235);

    doc.fillColor(grayColor).fontSize(9).text('Payment Method:', 50, 250);
    doc.fillColor(blackColor).fontSize(9).text('Razorpay (Online)', 120, 250);

    doc.fillColor(grayColor).fontSize(9).text('Transaction ID:', 300, 235);
    doc.fillColor(blackColor).fontSize(9).text(payment?.razorpayPaymentId || 'N/A', 380, 235);

    doc.fillColor(grayColor).fontSize(9).text('Payment Status:', 300, 250);
    doc.fillColor('#16A34A').fontSize(9).text('PAID', 380, 250);

    doc.moveTo(50, 280).lineTo(550, 280).strokeColor('#E5E7EB').stroke();

    // Table Header
    doc.fillColor(blackColor).fontSize(10).text('ITEMS', 50, 295);
    doc.text('QTY', 300, 295, { width: 50, align: 'right' });
    doc.text('UNIT PRICE', 380, 295, { width: 80, align: 'right' });
    doc.text('TOTAL', 480, 295, { width: 70, align: 'right' });

    doc.moveTo(50, 315).lineTo(550, 315).strokeColor('#1F2937').stroke();

    let y = 330;
    for (const item of order.items) {
      doc.fillColor(blackColor).fontSize(9).text(item.food.name, 50, y);
      doc.fillColor(grayColor).fontSize(8).text(item.food.description.substring(0, 60) + '...', 50, y + 12, { width: 220 });

      doc.fillColor(blackColor).fontSize(9).text(item.quantity.toString(), 300, y, { width: 50, align: 'right' });
      doc.text(`₹${Number(item.price).toFixed(2)}`, 380, y, { width: 80, align: 'right' });
      
      const itemTotal = Number(item.price) * item.quantity;
      doc.text(`₹${itemTotal.toFixed(2)}`, 480, y, { width: 70, align: 'right' });

      y += 35;
    }

    doc.moveTo(50, y).lineTo(550, y).strokeColor('#E5E7EB').stroke();
    y += 15;

    // Totals calculations
    const subtotal = order.items.reduce((sum: number, item: any) => sum + Number(item.price) * item.quantity, 0);

    doc.fillColor(grayColor).fontSize(9).text('Subtotal:', 350, y);
    doc.fillColor(blackColor).fontSize(9).text(`₹${subtotal.toFixed(2)}`, 480, y, { width: 70, align: 'right' });
    y += 15;

    doc.fillColor(grayColor).fontSize(9).text('Tax (8%):', 350, y);
    doc.fillColor(blackColor).fontSize(9).text(`₹${Number(order.tax).toFixed(2)}`, 480, y, { width: 70, align: 'right' });
    y += 15;

    if (Number(order.discount) > 0) {
      doc.fillColor(grayColor).fontSize(9).text('Discount:', 350, y);
      doc.fillColor('#DC2626').fontSize(9).text(`-₹${Number(order.discount).toFixed(2)}`, 480, y, { width: 70, align: 'right' });
      y += 15;
    }

    doc.moveTo(350, y).lineTo(550, y).strokeColor('#E5E7EB').stroke();
    y += 10;

    doc.fillColor(orangeColor).fontSize(12).text('Grand Total:', 350, y);
    doc.fillColor(orangeColor).fontSize(12).text(`₹${Number(order.total).toFixed(2)}`, 480, y, { width: 70, align: 'right' });

    // Footer
    y += 50;
    doc.fillColor(grayColor).fontSize(8).text('Thank you for ordering with FOODFLOW!', 50, y, { align: 'center' });
    doc.text('This is a computer-generated invoice and does not require a physical signature.', 50, y + 12, { align: 'center' });

    doc.end();

    const pdfBuffer = await endPromise;

    return {
      pdfUrl: `/public/invoices/${filename}`,
      pdfBuffer,
    };
  }
}
