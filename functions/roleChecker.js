const { createClientError } = require('./clientError');

class RoleChecker {
  /**
   * @param {[import('./user/user').Role]} roles
   */
  constructor(roles) {
    this.roles = roles;
    this.checkRolesMiddleware = this.checkRolesMiddleware.bind(this);
  }

  /**
   * @param {[import('./user/user').Role]} roles
   */
  checkRoles(roles) {
    if (this.roles.length === 0) return true;
    if (!roles) return false;

    const intersection = this.roles.filter((x) => roles.includes(x));
    return intersection.length > 0;
  }

  checkRolesMiddleware(req, res, next) {
    const { roles } = req.user;
    if (this.checkRoles(roles)) {
      next();
      return;
    } else {
      throw createClientError(403, 'Forbidden');
    }
  }
}

module.exports = RoleChecker;
