const Joi = require('joi');

// Unit Test: Validation Schemas
describe('Validation Schemas', () => {
  describe('User Registration Schema', () => {
    const userSchema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string()
        .min(8)
        .pattern(/[A-Z]/)
        .pattern(/[a-z]/)
        .pattern(/\d/)
        .pattern(/[@$!%*?&]/)
        .required()
        .messages({
          'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
        }),
    });

    it('should validate correct user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
      };

      const { error } = userSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'not-an-email',
        password: 'SecurePass123!',
      };

      const { error } = userSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('email');
    });

    it('should reject weak password', () => {
      const weakPassword = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
      };

      const { error } = userSchema.validate(weakPassword);
      expect(error).toBeDefined();
      expect(error.details[0].path).toContain('password');
    });
  });

  describe('Task Schema', () => {
    const taskSchema = Joi.object({
      title: Joi.string().min(1).max(255).required(),
      description: Joi.string().max(1000).allow(''),
      status: Joi.string().valid('TODO', 'IN_PROGRESS', 'DONE').default('TODO'),
      priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH').default('MEDIUM'),
    });

    it('should validate task with all fields', () => {
      const validTask = {
        title: 'Complete project',
        description: 'Finish the implementation',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
      };

      const { error, value } = taskSchema.validate(validTask);
      expect(error).toBeUndefined();
      expect(value.status).toBe('IN_PROGRESS');
    });

    it('should apply default values', () => {
      const minimalTask = {
        title: 'New Task',
      };

      const { error, value } = taskSchema.validate(minimalTask);
      expect(error).toBeUndefined();
      expect(value.status).toBe('TODO');
      expect(value.priority).toBe('MEDIUM');
    });
  });
});

