/**
 * Generates an auto-incrementing invoice number using the format:
 * INV-YYYY-XXXX (e.g. INV-2026-0001)
 *
 * @param prismaClient Prisma transaction client or instance
 * @returns string Unique sequential invoice number
 */
export async function generateInvoiceNumber(prismaClient: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `INV-${currentYear}-`;

  // Fetch all existing invoices for the current year to find the maximum sequence
  const thisYearInvoices = await prismaClient.invoice.findMany({
    where: {
      invoiceNo: {
        startsWith: prefix,
      },
    },
    select: {
      invoiceNo: true,
    },
  });

  let maxSeq = 0;
  for (const inv of thisYearInvoices) {
    if (inv.invoiceNo && inv.invoiceNo.startsWith(prefix)) {
      const seqStr = inv.invoiceNo.substring(prefix.length);
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;

  // Ensure collision-free uniqueness
  let exists = await prismaClient.invoice.findUnique({
    where: { invoiceNo: candidate },
  });

  while (exists) {
    nextSeq++;
    candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    exists = await prismaClient.invoice.findUnique({
      where: { invoiceNo: candidate },
    });
  }

  return candidate;
}

/**
 * Generates an auto-incrementing purchase number using the format:
 * PUR-YYYY-XXXX (e.g. PUR-2026-0001)
 *
 * @param prismaClient Prisma transaction client or instance
 * @returns string Unique sequential purchase number
 */
export async function generatePurchaseNumber(prismaClient: any): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `PUR-${currentYear}-`;

  const thisYearPurchases = await prismaClient.purchase.findMany({
    where: {
      purchaseNo: {
        startsWith: prefix,
      },
    },
    select: {
      purchaseNo: true,
    },
  });

  let maxSeq = 0;
  for (const p of thisYearPurchases) {
    if (p.purchaseNo && p.purchaseNo.startsWith(prefix)) {
      const seqStr = p.purchaseNo.substring(prefix.length);
      const seqNum = parseInt(seqStr, 10);
      if (!isNaN(seqNum) && seqNum > maxSeq) {
        maxSeq = seqNum;
      }
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;

  let exists = await prismaClient.purchase.findUnique({
    where: { purchaseNo: candidate },
  });

  while (exists) {
    nextSeq++;
    candidate = `${prefix}${String(nextSeq).padStart(4, '0')}`;
    exists = await prismaClient.purchase.findUnique({
      where: { purchaseNo: candidate },
    });
  }

  return candidate;
}
