"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleModels = exports.projectModel = exports.departmentModel = exports.employeeModel = void 0;
/**
 * Example: Employee model with basic fields
 */
exports.employeeModel = {
    name: 'Employee',
    fields: [
        {
            name: 'id',
            type: 'number',
            required: true,
            unique: true
        },
        {
            name: 'name',
            type: 'string',
            required: true
        },
        {
            name: 'age',
            type: 'number',
            required: false
        },
        {
            name: 'isActive',
            type: 'boolean',
            required: false,
            default: true
        },
        {
            name: 'email',
            type: 'string',
            required: true,
            unique: true
        },
        {
            name: 'hireDate',
            type: 'date',
            required: false
        },
        {
            name: 'ownerId',
            type: 'number',
            required: true
        }
    ],
    ownerField: 'ownerId',
    rbac: {
        Admin: ['all'],
        Manager: ['create', 'read', 'update'],
        Viewer: ['read']
    },
    timestamps: true
};
/**
 * Example: Department model with relation to Employee
 */
exports.departmentModel = {
    name: 'Department',
    fields: [
        {
            name: 'id',
            type: 'number',
            required: true,
            unique: true
        },
        {
            name: 'name',
            type: 'string',
            required: true
        },
        {
            name: 'manager',
            type: 'relation',
            required: false,
            relation: {
                model: 'Employee',
                type: 'one-to-one',
                foreignKey: 'managerId',
                references: 'id'
            }
        }
    ],
    rbac: {
        Admin: ['all'],
        Manager: ['read', 'update']
    },
    timestamps: true
};
/**
 * Example: Project model with many-to-many relation
 */
exports.projectModel = {
    name: 'Project',
    fields: [
        {
            name: 'id',
            type: 'number',
            required: true,
            unique: true
        },
        {
            name: 'title',
            type: 'string',
            required: true
        },
        {
            name: 'description',
            type: 'string',
            required: false
        },
        {
            name: 'budget',
            type: 'number',
            required: false
        },
        {
            name: 'metadata',
            type: 'json',
            required: false
        },
        {
            name: 'employees',
            type: 'relation',
            required: false,
            relation: {
                model: 'Employee',
                type: 'many-to-many'
            }
        }
    ],
    rbac: {
        Admin: ['all'],
        Manager: ['create', 'read', 'update'],
        Employee: ['read']
    },
    timestamps: true
};
/**
 * All example models
 */
exports.exampleModels = [
    exports.employeeModel,
    exports.departmentModel,
    exports.projectModel
];
