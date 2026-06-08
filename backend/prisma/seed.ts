await prisma.medicine.createMany({
  data: [
    {
      name: "Crocin 500mg",
      company: "GSK",
      sellingPrice: 25,
      purchasePrice: 18,
      stock: 100,
      batchNo: "CR001"
    },
    {
      name: "Dolo 650",
      company: "Micro Labs",
      sellingPrice: 30,
      purchasePrice: 20,
      stock: 200,
      batchNo: "DL001"
    }
  ]
})