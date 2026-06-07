export const adminOnly = async (req, res, next) => {

  try {

    if (req.user && req.user.role === "admin") {

      next();

    } else {

      return res.status(403).json({
        success: false,
        msg: "Admin access only",
      });

    }

  } catch (error) {

    return res.status(500).json({
      success: false,
      msg: "Server error",
    });

  }
};