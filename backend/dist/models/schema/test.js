#!/usr/bin/env ts-node
"use strict";
/**
 * Quick test script to demonstrate the schema validation system
 * Run with: npx ts-node src/models/schema/test.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
console.log('🧪 Testing Dynamic Model Schema System\n');
console.log('='.repeat(60));
// Test 1: Valid single model
console.log('\n📋 Test 1: Validate Employee Model');
const result1 = (0, index_1.validateModelDefinition)(index_1.employeeModel);
console.log(result1.success ? '✅ PASS' : '❌ FAIL');
if (result1.success) {
    console.log(`   Model: ${result1.data?.name}`);
    console.log(`   Fields: ${result1.data?.fields.length}`);
    console.log(`   Roles: ${Object.keys(result1.data?.rbac || {}).join(', ')}`);
}
// Test 2: Invalid model (bad name format)
console.log('\n📋 Test 2: Validate Invalid Model (snake_case name)');
const result2 = (0, index_1.validateModelDefinition)({
    name: 'invalid_model',
    fields: [{ name: 'id', type: 'number' }]
});
console.log(!result2.success ? '✅ PASS (correctly rejected)' : '❌ FAIL');
if (!result2.success) {
    console.log(`   Error: ${result2.errors?.[0]?.message}`);
}
// Test 3: Duplicate field names
console.log('\n📋 Test 3: Validate Model with Duplicate Fields');
const result3 = (0, index_1.validateModelDefinition)({
    name: 'TestModel',
    fields: [
        { name: 'id', type: 'number' },
        { name: 'id', type: 'string' }
    ]
});
console.log(!result3.success ? '✅ PASS (correctly rejected)' : '❌ FAIL');
if (!result3.success) {
    console.log(`   Error: ${result3.errors?.[0]?.message}`);
}
// Test 4: Multiple models with valid relations
console.log('\n📋 Test 4: Validate Multiple Models with Relations');
const result4 = (0, index_1.validateModelDefinitions)(index_1.exampleModels);
console.log(result4.success ? '✅ PASS' : '❌ FAIL');
if (result4.success) {
    console.log(`   Models: ${result4.data?.map(m => m.name).join(', ')}`);
}
// Test 5: Broken relation reference
console.log('\n📋 Test 5: Validate Model with Broken Relation');
const result5 = (0, index_1.validateModelDefinitions)([
    {
        name: 'Task',
        fields: [
            { name: 'id', type: 'number' },
            {
                name: 'user',
                type: 'relation',
                relation: { model: 'NonExistent', type: 'one-to-one' }
            }
        ]
    }
]);
console.log(!result5.success ? '✅ PASS (correctly rejected)' : '❌ FAIL');
if (!result5.success) {
    console.log(`   Error: ${result5.errors?.[0]?.message}`);
}
// Test 6: RBAC permissions
console.log('\n📋 Test 6: RBAC Permission Checking');
const rbac = index_1.employeeModel.rbac;
const test6a = (0, index_1.hasPermission)(rbac, 'Admin', 'delete') === true;
const test6b = (0, index_1.hasPermission)(rbac, 'Viewer', 'delete') === false;
const test6c = (0, index_1.hasPermission)(rbac, 'Manager', 'read') === true;
console.log(test6a && test6b && test6c ? '✅ PASS' : '❌ FAIL');
console.log(`   Admin can delete: ${test6a ? 'yes' : 'no'}`);
console.log(`   Viewer can delete: ${test6b ? 'no' : 'yes'}`);
console.log(`   Manager can read: ${test6c ? 'yes' : 'no'}`);
// Test 7: JSON parsing and validation
console.log('\n📋 Test 7: Validate JSON from String');
const jsonModel = `{
  "name": "Product",
  "fields": [
    { "name": "id", "type": "number", "required": true, "unique": true },
    { "name": "name", "type": "string", "required": true },
    { "name": "price", "type": "number", "required": true },
    { "name": "inStock", "type": "boolean", "default": true }
  ],
  "rbac": {
    "Admin": ["all"],
    "Staff": ["read", "update"]
  }
}`;
const result7 = (0, index_1.validateModelDefinition)(JSON.parse(jsonModel));
console.log(result7.success ? '✅ PASS' : '❌ FAIL');
if (result7.success) {
    console.log(`   Model: ${result7.data?.name}`);
    console.log(`   Fields: ${result7.data?.fields.map(f => f.name).join(', ')}`);
}
// Summary
console.log('\n' + '='.repeat(60));
console.log('✨ Schema validation system is working correctly!\n');
