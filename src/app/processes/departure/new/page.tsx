"use client";

import React, { useState } from "react";

const Form = () => {
  const [formData, setFormData] = useState({
    client: "",
    exitOrderNumber: "",
    registrationDate: "01/30/2025 | 13:56:39",
    documentType: "",
    documentNumber: "",
    transferDateTime: "",
    documentDate: "",
    assignedPersonnel: "",
    documentStatus: "Registered",
    destinationPoint: "",
    packagingType: "Standard",
    responsiblePersonPickedUp: "Standard",
    responsiblePersonID: "",
    centralOrderProcessID: "",
    observation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
  };

  return (
    <div className="p-6 bg-gray-100">
      <p className="text-blue-900 font-bold pb-2">Departure Order</p>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Clients */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Clients:</label>
            <select
              name="client"
              value={formData.client}
              onChange={handleChange}
              className="w-48 border border-gray-300 rounded"
            >
              <option value="">Select</option>
              {/* Add more options here */}
            </select>
          </div>

          {/* Exit Order Number */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Exit Order Number:
            </label>
            <input
              type="text"
              name="exitOrderNumber"
              value={formData.exitOrderNumber}
              onChange={handleChange}
              className="w-48 border border-gray-300 rounded"
            />
          </div>

          {/* Registration Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Registration Date:
            </label>
            <span className="w-48 border border-gray-300 rounded bg-gray-50">
              {formData.registrationDate}
            </span>
          </div>

          {/* Document Type */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Document Type:</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-48 border border-gray-300 rounded"
            >
              <option value="">Select</option>
              {/* Add more options here */}
            </select>
          </div>

          {/* Document Number */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Document Number:</label>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              className="w-48 border border-gray-300 rounded"
            />
          </div>

          {/* Transfer Date and Time */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Transfer Date and Time:
            </label>
            <input
              type="datetime-local"
              name="transferDateTime"
              value={formData.transferDateTime}
              onChange={handleChange}
              className="w-48 border border-gray-300 rounded"
            />
          </div>

          {/* Document Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Document Date:</label>
            <input
              type="file"
              name="documentDate"
              onChange={handleChange}
              className="w-48 border border-gray-300 rounded"
            />
          </div>

          {/* Assigned Personnel */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Assigned Personnel:
            </label>
            <select
              name="assignedPersonnel"
              value={formData.assignedPersonnel}
              onChange={handleChange}
              className=" w-48 border border-gray-300 rounded"
            >
              <option value="">Select</option>
              {/* Add more options here */}
            </select>
          </div>

          {/* Document Status */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Document Status:</label>
            <div className="flex items-center">
              <select
                name="assignedPersonnel"
                disabled
                value={formData.assignedPersonnel}
                onChange={handleChange}
                className=" w-48 border border-gray-300 rounded bg-gray-200"
              >
                <option value="">Select</option>
                {/* Add more options here */}
              </select>
            </div>
          </div>

          {/* Arrival Point */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Arrival Point:</label>
            <input
              type="text"
              name="destinationPoint"
              value={formData.destinationPoint}
              onChange={handleChange}
              className=" w-[60%] border border-gray-300 rounded"
            />
          </div>

          {/* Packaging Type */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Packaging Type:</label>
            <div className="flex items-center">
              <select
                name="assignedPersonnel"
                value={formData.assignedPersonnel}
                onChange={handleChange}
                className=" w-48 border border-gray-300 rounded"
              >
                <option value="">Select</option>
                {/* Add more options here */}
              </select>
            </div>
          </div>

          {/* Responsible Person Picked Up */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Responsible Person Picked Up:
            </label>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="responsiblePersonPickedUp"
                checked={formData.responsiblePersonPickedUp === "Standard"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    responsiblePersonPickedUp: e.target.checked
                      ? "Standard"
                      : "",
                  })
                }
                className="mr-2"
              />
              Standard
            </div>
          </div>

          {/* Responsible Person ID */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Responsible Person ID:
            </label>
            <input
              type="text"
              name="responsiblePersonID"
              value={formData.responsiblePersonID}
              onChange={handleChange}
              className=" w-48 border border-gray-300 rounded"
            />
          </div>

          {/* Central Order Process ID */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">
              Central Order Process ID:
            </label>
            <input
              type="text"
              name="centralOrderProcessID"
              value={formData.centralOrderProcessID}
              onChange={handleChange}
              className=" w-48 border border-gray-300 rounded"
            />
          </div>

          {/* Observation */}
          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">Observation:</label>
            <textarea
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              className="w-[40%] border border-gray-300 rounded"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Register
          </button>
          <button
            type="button"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Consultant
          </button>
        </div>
      </form>
    </div>
  );
};

export default Form;
