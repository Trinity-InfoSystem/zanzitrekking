const PdfModel = require("../../models/pdf");
const logger = require('./../../utilities/logger');
const fs = require("fs").promises;
const path = require("path");

class PDFController {
  // Helper function to get full URL (static method)
  static getFullUrl(req, filename) {
    return `${req.protocol}://${req.get("host")}/public/pdfs/${filename}`;
  }

  // Get all PDFs
  async get_pdfs(req, res) {
    try {
      const pdfs = await PdfModel.find().sort({ createdAt: -1 });

      // Transform PDFs to include URLs
      const transformedPdfs = pdfs.map((pdf) => {
        const pdfObj = pdf.toObject();
        return {
          ...pdfObj,
          url: PDFController.getFullUrl(req, pdf.path),
        };
      });

      res.status(200).json({ pdfs: transformedPdfs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get single PDF by type
  async get_pdf(req, res) {
    try {
      const pdf = await PdfModel.findOne({ type: req.params.type });
      if (!pdf) {
        return res.status(404).json({ error: "PDF not found" });
      }

      const pdfObj = pdf.toObject();
      const transformedPdf = {
        ...pdfObj,
        url: PDFController.getFullUrl(req, pdf.path),
      };

      res.status(200).json({ pdf: transformedPdf });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Add new PDF
  async add_pdf(req, res) {
    try {
      const { type } = req.body;

      if (!req.file) {
        return res.status(400).json({ error: "PDF file is required" });
      }

      const existingPdf = await PdfModel.findOne({ type });

      if (existingPdf) {
        const oldFilePath = path.join(
          __dirname,
          "../../public/pdfs",
          existingPdf.path
        );

        try {
          await fs.unlink(oldFilePath);
        } catch (error) {
          logger.info("ℹ️ No old file to delete:", error.message);
        }

        await PdfModel.deleteOne({ _id: existingPdf._id });
      }

      const newPdf = await PdfModel.create({
        name: req.file.originalname,
        type,
        path: req.file.filename,
      });

      const pdfObj = newPdf.toObject();
      const transformedPdf = {
        ...pdfObj,
        url: PDFController.getFullUrl(req, newPdf.path),
      };

      res.status(201).json({
        message: "PDF uploaded successfully",
        pdf: transformedPdf,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Update PDF
  async update_pdf(req, res) {
    try {
      const pdf = await PdfModel.findById(req.params.pdfId);
      if (!pdf) {
        return res.status(404).json({ error: "PDF not found" });
      }

      if (req.file) {
        const oldFilePath = path.join(__dirname, "../../public/pdfs", pdf.path);

        try {
          await fs.unlink(oldFilePath);
        } catch (error) {
          logger.info("ℹ️ No old file to delete:", error.message);
        }

        pdf.name = req.file.originalname;
        pdf.path = req.file.filename;
      }

      if (req.body.type) {
        pdf.type = req.body.type;
      }

      await pdf.save();

      const pdfObj = pdf.toObject();
      const transformedPdf = {
        ...pdfObj,
        url: PDFController.getFullUrl(req, pdf.path),
      };

      res.status(200).json({
        message: "PDF updated successfully",
        pdf: transformedPdf,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Delete PDF
  async delete_pdf(req, res) {
    try {
      const pdf = await PdfModel.findById(req.params.pdfId);
      if (!pdf) {
        return res.status(404).json({ error: "PDF not found" });
      }

      const filePath = path.join(__dirname, "../../public/pdfs", pdf.path);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        logger.info("ℹ️ No old file to delete:", error.message);
      }

      await PdfModel.deleteOne({ _id: req.params.pdfId });

      res.status(200).json({
        message: "PDF deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new PDFController();
