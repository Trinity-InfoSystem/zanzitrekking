const ClientModel = require("../../models/client");
const { responseReturn } = require("../../utilities/response");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

class ClientController {
  // Add Client
  add_client = async (req, res) => {
    try {
      const { name, logoUrl, website, order } = req.body;

      // Extract the logo file if uploaded
      const logoFile = req.file;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      // Use uploaded file or URL
      const logo = logoFile ? `${basePath}${logoFile.filename}` : null;

      const newClient = {
        name,
        logo: logo || null,
        logoUrl: logoUrl || null,
        website: website || "",
        order: parseInt(order) || 0,
      };

      const createdClient = await ClientModel.create(newClient);
      responseReturn(res, 201, {
        message: "Client Added Successfully",
        client: createdClient,
      });
    } catch (error) {
      console.error("Error adding client:", error);
      responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
      });
    }
  };

  // Update Client
  update_client = async (req, res) => {
    try {
      const { clientId } = req.params;
      const { name, logoUrl, website, order } = req.body;

      const existingClient = await ClientModel.findById(clientId);
      if (!existingClient) {
        return responseReturn(res, 404, { error: "Client not found" });
      }

      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

      const updateFields = {
        name: name || existingClient.name,
        website: website || existingClient.website,
        order: parseInt(order) !== undefined ? parseInt(order) : existingClient.order,
      };

      // Handle logo update
      const logoFile = req.file;
      if (logoFile) {
        // Delete old logo if it exists and was uploaded
        if (existingClient.logo && existingClient.logo.includes("/public/uploads/")) {
          const oldLogoFileName = path.basename(existingClient.logo);
          const oldLogoPath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldLogoFileName
          );
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }
        updateFields.logo = `${basePath}${logoFile.filename}`;
        updateFields.logoUrl = null; // Clear URL if file uploaded
      } else if (logoUrl !== undefined) {
        // If URL provided, use it and clear uploaded logo
        updateFields.logoUrl = logoUrl || null;
        if (logoUrl && existingClient.logo && existingClient.logo.includes("/public/uploads/")) {
          const oldLogoFileName = path.basename(existingClient.logo);
          const oldLogoPath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            oldLogoFileName
          );
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
          }
        }
        updateFields.logo = null;
      }

      const updatedClient = await ClientModel.findByIdAndUpdate(
        clientId,
        updateFields,
        { new: true, runValidators: true }
      );

      responseReturn(res, 200, {
        message: "Client updated successfully",
        client: updatedClient,
      });
    } catch (error) {
      console.error("Error updating client:", error);
      responseReturn(res, 500, {
        error: "Internal server error",
        details: error.message,
      });
    }
  };

  // Get Clients
  get_clients = async (req, res) => {
    const { page, searchValue, parPage } = req.query;

    try {
      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }
      let query = {};
      if (searchValue) {
        query.name = { $regex: searchValue, $options: "i" };
      }
      let clientsQuery = ClientModel.find(query);
      if (page && parPage) {
        clientsQuery = clientsQuery.skip(skipPage).limit(parPage);
      }
      clientsQuery = clientsQuery.sort({ order: 1, createdAt: -1 });
      const clients = await clientsQuery;
      const totalClients = await ClientModel.countDocuments(query);
      responseReturn(res, 200, {
        totalClients,
        clients,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Get Active Clients for Frontend
  get_active_clients = async (req, res) => {
    try {
      const clients = await ClientModel.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select("name logo logoUrl website");

      responseReturn(res, 200, {
        clients,
      });
    } catch (error) {
      responseReturn(res, 500, {
        error: "Error fetching clients",
        details: error.message,
      });
    }
  };

  // Get Single Client
  get_client = async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await ClientModel.findById(clientId);
      if (!client) {
        return responseReturn(res, 404, { error: "Client not found" });
      }
      responseReturn(res, 200, { client });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Delete Client
  delete_client = async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await ClientModel.findById(clientId);
      if (!client) {
        return responseReturn(res, 404, { error: "Client not found" });
      }

      // Delete logo file if exists
      if (client.logo && client.logo.includes("/public/uploads/")) {
        const logoFileName = path.basename(client.logo);
        const logoPath = path.resolve(
          __dirname,
          "..",
          "..",
          "public",
          "uploads",
          logoFileName
        );
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
        }
      }

      await ClientModel.findByIdAndDelete(clientId);
      responseReturn(res, 200, { message: "Client deleted successfully" });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Toggle Client Status
  toggle_client_status = async (req, res) => {
    try {
      const { clientId } = req.params;
      const client = await ClientModel.findById(clientId);
      if (!client) {
        return responseReturn(res, 404, { error: "Client not found" });
      }

      client.isActive = !client.isActive;
      await client.save();

      responseReturn(res, 200, {
        message: "Client status updated successfully",
        client,
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };

  // Delete Multiple Clients
  delete_clients = async (req, res) => {
    try {
      const { clientIds } = req.body;
      if (!Array.isArray(clientIds) || clientIds.length === 0) {
        return responseReturn(res, 400, { error: "Invalid client IDs" });
      }

      const clients = await ClientModel.find({ _id: { $in: clientIds } });

      // Delete logo files
      clients.forEach((client) => {
        if (client.logo && client.logo.includes("/public/uploads/")) {
          const logoFileName = path.basename(client.logo);
          const logoPath = path.resolve(
            __dirname,
            "..",
            "..",
            "public",
            "uploads",
            logoFileName
          );
          if (fs.existsSync(logoPath)) {
            fs.unlinkSync(logoPath);
          }
        }
      });

      await ClientModel.deleteMany({ _id: { $in: clientIds } });
      responseReturn(res, 200, {
        message: "Clients deleted successfully",
      });
    } catch (error) {
      responseReturn(res, 500, { error: "internal server error" });
    }
  };
}

module.exports = new ClientController();

