const { Router } = require("express");

const jwt = require("jsonwebtoken");
const { HTTP_STATUS } = require("../constants/api.constants");
const { SECRET_KEY, SESSION_KEY } = require("../config/env.config");
const { passportCustom } = require("../middlewares/passportCustom.middleware");
const { apiErrorResponse } = require("../utils/api.utils");

class BaseRouter {
  constructor() {
    this.router = Router();
    this.init();
  }

  init() {}

  getRouter() {
    return this.router;
  }

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...params) => {
      try {
        await callback.apply(this, params);
      } catch (error) {
        params[2](error); //params[2] is equal to next() (req,res,next). next is on second position
      }
    });
  }

  handleAuthRoles(roles) {
    return async (req, res, next) => {
      if (roles[0] === "PUBLIC") {
        return next();
      }

      const token = req.cookies[SESSION_KEY];
      if (!token) {
        const response = apiErrorResponse("Unauthorized");
        return res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
      }

      const user = jwt.verify(token, SECRET_KEY);
      if (!roles.includes(`${user.role}`.toLowerCase())) {
        const response = apiErrorResponse("Access Denied");
        return res.status(HTTP_STATUS.FORBIDDEN).json(response);
      }
      next();
    };
  }

  get(path, roles, ...callbacks) {
    this.router.get(
      path,
      passportCustom("jwt"),
      this.handleAuthRoles(roles),
      this.applyCallbacks(callbacks)
    );
  }

  post(path, roles, ...callbacks) {
    this.router.post(
      path,
      passportCustom("jwt"),
      this.handleAuthRoles(roles),
      this.applyCallbacks(callbacks)
    );
  }

  put(path, roles, ...callbacks) {
    this.router.put(
      path,
      passportCustom("jwt"),
      this.handleAuthRoles(roles),
      this.applyCallbacks(callbacks)
    );
  }

  delete(path, roles, ...callbacks) {
    this.router.delete(
      path,
      passportCustom("jwt"),
      this.handleAuthRoles(roles),
      this.applyCallbacks(callbacks)
    );
  }
}

module.exports = { BaseRouter };
