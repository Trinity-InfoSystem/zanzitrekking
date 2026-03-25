const Job = require("../../models/job");
const logger = require('./../../utilities/logger');
const { responseReturn } = require("../../utilities/response");
const redis = require('../../redis');
const crypto = require("crypto");
const mongoose = require("mongoose");
const slugify = require("slugify");

const isMongoObjectId = (value) => /^[a-f\d]{24}$/i.test(String(value || ""));

const generateUniqueSlug = async ({ model, base, excludeId }) => {
  const baseSlug = slugify(base || "", { lower: true, strict: true });
  if (!baseSlug) return "";

  let slug = baseSlug;
  let counter = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = { slug };
    if (excludeId && mongoose.Types.ObjectId.isValid(excludeId)) {
      query._id = { $ne: new mongoose.Types.ObjectId(excludeId) };
    }

    const exists = await model.findOne(query).select("_id").lean();
    if (!exists) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};

class JobControllers {
  get_one_job = async (req, res) => {
    const { jobId } = req.params;
    try {
      const job = isMongoObjectId(jobId)
        ? await Job.findById(jobId).populate("createdBy", "name email")
        : await Job.findOne({ slug: jobId }).populate("createdBy", "name email");
      if (!job) {
        return responseReturn(res, 404, { error: "Job Not Found" });
      }

      const cacheKeyId = job.slug || job._id.toString();
      const key = `home:job:${cacheKeyId}`;
      await redis.set(key, JSON.stringify(job), "EX", 43200);
      return responseReturn(res, 200, {
        message: "Job Fetch Successful",
        job,
      });
    } catch (error) {
      return responseReturn(res, 500, { error: "Internal Server Error" });
    }
  };

  add_job = async (req, res) => {
    try {
      const {
        title,
        description,
        contentType,
        htmlContent,
        requirements,
        location,
        employmentType,
        salaryRange,
        applicationDeadline,
        isActive,
      } = req.body;

      if (!title) {
        return responseReturn(res, 400, {
          error: "Title is required",
        });
      }

      // Determine content type (default to structured if not provided)
      const finalContentType = contentType || "structured";

      // Validate content based on contentType
      if (finalContentType === "html") {
        if (!htmlContent || htmlContent.trim() === "") {
          return responseReturn(res, 400, {
            error: "HTML content is required when content type is HTML",
          });
        }
      } else {
        // For structured content, validate required fields
        if (!description || description.trim() === "") {
          return responseReturn(res, 400, {
            error: "Description is required for structured content",
          });
        }
        if (!employmentType) {
          return responseReturn(res, 400, {
            error: "Employment type is required for structured content",
          });
        }
      }

      // Parse requirements if it's a string
      let requirementsArray = [];
      if (requirements) {
        if (typeof requirements === "string") {
          requirementsArray = requirements
            .split(",")
            .map((req) => req.trim())
            .filter((req) => req.length > 0);
        } else if (Array.isArray(requirements)) {
          requirementsArray = requirements
            .filter((req) => typeof req === "string")
            .map((req) => req.trim())
            .filter((req) => req.length > 0);
        }
      }

      // Parse isActive
      const activeStatus =
        isActive === "true" || isActive === true ? true : false;

      // Parse applicationDeadline if provided
      let deadlineDate = null;
      if (applicationDeadline) {
        deadlineDate = new Date(applicationDeadline);
        if (isNaN(deadlineDate.getTime())) {
          return responseReturn(res, 400, {
            error: "Invalid application deadline date",
          });
        }
      }

      // Build job data based on content type
      const jobData = {
        title,
        slug: await generateUniqueSlug({ model: Job, base: title }),
        contentType: finalContentType,
        htmlContent: finalContentType === "html" ? htmlContent : "",
        description: finalContentType === "html" ? "" : (description || ""),
        isActive: activeStatus,
        createdBy: req.user?.id || null,
      };

      // Include structured fields for both content types
      // For HTML content, these fields are optional but can still be provided
      jobData.requirements = finalContentType === "structured" ? requirementsArray : [];
      jobData.location = location || "";
      jobData.employmentType = employmentType || "full-time";
      jobData.salaryRange = salaryRange || "";
      jobData.applicationDeadline = deadlineDate;

      const job = await Job.create(jobData);

      if (!job) {
        return responseReturn(res, 500, {
          error: "Job couldn't be created",
        });
      }
      await redis.del(`home:job:${job._id}`);
      if (job.slug) await redis.del(`home:job:${job.slug}`);
      return responseReturn(res, 201, {
        message: "Job Successfully created",
        job,
      });
    } catch (err) {
      logger.error(err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  get_jobs = async (req, res) => {
    const {
      page,
      searchValue,
      parPage,
      allJobs = "false",
      sort = "newest-desc",
      isActive,
    } = req.query;
    try {
      const hash = crypto
        .createHash("md5")
        .update(JSON.stringify({ page: Number(page), parPage: Number(parPage), searchValue, sort, isActive }))
        .digest("hex");

      const key = `home:jobs:list:${hash}`;
      // Determine sort order
      let sortOptions = {};
      let collation = null;
      if (sort === "title-asc") {
        sortOptions = { title: 1 };
        collation = { locale: "en", strength: 2 };
      } else if (sort === "title-desc") {
        sortOptions = { title: -1 };
        collation = { locale: "en", strength: 2 };
      } else if (sort === "newest-asc") {
        sortOptions = { createdAt: 1 };
      } else {
        sortOptions = { createdAt: -1 };
      }

      let skipPage = "";
      if (parPage && page) {
        skipPage = +parPage * (+page - 1);
      }

      // Build query
      let query = {};
      if (searchValue) {
        query.$or = [
          { title: { $regex: searchValue, $options: "i" } },
          { description: { $regex: searchValue, $options: "i" } },
          { location: { $regex: searchValue, $options: "i" } },
        ];
      }

      // Filter by isActive if provided
      if (isActive !== undefined) {
        query.isActive = isActive === "true" || isActive === true;
      }

      if (searchValue && page && parPage && allJobs === "false") {
        let dbQuery = Job.find(query).skip(skipPage).limit(+parPage);

        if (collation) {
          dbQuery = dbQuery.sort(sortOptions).collation(collation);
        } else {
          dbQuery = dbQuery.sort(sortOptions);
        }

        const jobs = await dbQuery.populate("createdBy", "name email");
        const totalJobs = await Job.find(query).countDocuments();

        return responseReturn(res, 200, {
          totalJobs,
          jobs,
        });
      } else if (searchValue === "" && page && parPage && allJobs === "false") {
        let dbQuery = Job.find(query).skip(skipPage).limit(+parPage);

        if (collation) {
          dbQuery = dbQuery.sort(sortOptions).collation(collation);
        } else {
          dbQuery = dbQuery.sort(sortOptions);
        }

        const jobs = await dbQuery.populate("createdBy", "name email");
        const totalJobs = await Job.find(query).countDocuments();

        return responseReturn(res, 200, {
          totalJobs,
          jobs,
        });
      } else {
        // For dropdowns/selects
        const jobs = await Job.find(query)
          .sort({ title: 1 })
          .collation({ locale: "en", strength: 2 })
          .populate("createdBy", "name email");
        const totalJobs = await Job.find(query).countDocuments();

        const responseData = {
          totalJobs,
          jobs,
          message: "Jobs successfully fetched",
        };
        await redis.set(key, JSON.stringify(responseData), "EX", 43200);
        return responseReturn(res, 200, {
          totalJobs,
          jobs,
          message: "Jobs successfully fetched",
        });
      }
    } catch (error) {
      logger.error(error);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  update_job = async (req, res) => {
    try {
      const { jobId } = req.params;
      const {
        title,
        description,
        contentType,
        htmlContent,
        requirements,
        location,
        employmentType,
        salaryRange,
        applicationDeadline,
        isActive,
      } = req.body;

      // Validate input
      if (!title) {
        return responseReturn(res, 400, {
          error: "Title is required",
        });
      }

      // Determine content type (default to structured if not provided)
      const finalContentType = contentType || "structured";

      // Validate content based on contentType
      if (finalContentType === "html") {
        if (!htmlContent || htmlContent.trim() === "") {
          return responseReturn(res, 400, {
            error: "HTML content is required when content type is HTML",
          });
        }
      } else {
        // For structured content, validate required fields
        if (!description || description.trim() === "") {
          return responseReturn(res, 400, {
            error: "Description is required for structured content",
          });
        }
        if (!employmentType) {
          return responseReturn(res, 400, {
            error: "Employment type is required for structured content",
          });
        }
      }

      // Fetch the existing job
      const existingJob = await Job.findById(jobId);
      if (!existingJob) {
        return responseReturn(res, 404, { error: "Job not found" });
      }

      // Parse requirements
      let requirementsArray = [];
      if (requirements) {
        if (typeof requirements === "string") {
          requirementsArray = requirements
            .split(",")
            .map((req) => req.trim())
            .filter((req) => req.length > 0);
        } else if (Array.isArray(requirements)) {
          requirementsArray = requirements
            .filter((req) => typeof req === "string")
            .map((req) => req.trim())
            .filter((req) => req.length > 0);
        }
      }

      // Parse isActive
      const activeStatus =
        isActive === "true" || isActive === true ? true : false;

      // Parse applicationDeadline
      let deadlineDate = existingJob.applicationDeadline;
      if (applicationDeadline) {
        deadlineDate = new Date(applicationDeadline);
        if (isNaN(deadlineDate.getTime())) {
          return responseReturn(res, 400, {
            error: "Invalid application deadline date",
          });
        }
      }

      // Prepare the update object based on content type
      const updateFields = {
        title,
        contentType: finalContentType,
        htmlContent: finalContentType === "html" ? htmlContent : "",
        description: finalContentType === "html" ? "" : (description || ""),
        isActive: activeStatus,
      };

      if (title && title !== existingJob.title) {
        updateFields.slug = await generateUniqueSlug({
          model: Job,
          base: title,
          excludeId: jobId,
        });
      }

      // Include structured fields for both content types
      // For HTML content, these fields are optional but can still be provided
      updateFields.requirements = finalContentType === "structured" ? requirementsArray : [];
      updateFields.location = location || "";
      updateFields.employmentType = employmentType || "full-time";
      updateFields.salaryRange = salaryRange || "";
      updateFields.applicationDeadline = deadlineDate;

      // Update the job
      const updatedJob = await Job.findByIdAndUpdate(jobId, updateFields, {
        new: true,
      }).populate("createdBy", "name email");

      if (!updatedJob) {
        return responseReturn(res, 404, { error: "Job not found" });
      }
      await redis.del(`home:job:${jobId}`);
      if (existingJob.slug) await redis.del(`home:job:${existingJob.slug}`);
      if (updatedJob.slug) await redis.del(`home:job:${updatedJob.slug}`);

      return responseReturn(res, 200, {
        message: "Job successfully updated",
        job: updatedJob,
      });
    } catch (err) {
      logger.error("Error updating job:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  delete_job = async (req, res) => {
    const { jobId } = req.params;

    try {
      const deletedJob = await Job.findByIdAndDelete(jobId);

      if (!deletedJob) {
        return responseReturn(res, 404, { error: "Job not found" });
      }
      await redis.del(`home:job:${jobId}`);
      if (deletedJob.slug) await redis.del(`home:job:${deletedJob.slug}`);

      return responseReturn(res, 200, {
        message: "Job deleted successfully",
      });
    } catch (err) {
      logger.error("Error deleting job:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };

  toggle_job_status = async (req, res) => {
    const { jobId } = req.params;

    try {
      const job = await Job.findById(jobId);

      if (!job) {
        return responseReturn(res, 404, { error: "Job not found" });
      }

      job.isActive = !job.isActive;
      await job.save();

      return responseReturn(res, 200, {
        message: `Job ${
          job.isActive ? "activated" : "deactivated"
        } successfully`,
        job,
      });
    } catch (err) {
      logger.error("Error toggling job status:", err);
      return responseReturn(res, 500, { error: "Internal server error" });
    }
  };
}

module.exports = new JobControllers();
