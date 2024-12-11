import { z } from "zod";

export const onboardingSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  address: z.string().min(2, "Address is required"),
});

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice name is required"),
  total: z.number().min(1, "$1 is the minimun.)"),
  status: z.enum(["PAID", "PENDING"]).default("PENDING"),
  date: z.string().min(1, "Date is requred."),
  dueDate: z.number().min(0, "Due date is requred."),
  // From
  fromName: z.string().min(1, "Your name is requred."),
  fromEmail: z.string().email("Invalid email address."),
  fromAddress: z.string().min(1, "Your address is requred."),
  // Client
  clientName: z.string().min(1, "Client name is requred."),
  clientEmail: z.string().email("Invalid client email address."),
  clientAddress: z.string().min(1, "Client address is requred."),

  currency: z.string().min(1, "Currency is requred."),
  invoiceNumber: z.number().min(1, "Minimum invoice number of 1."),

  note: z.string().optional(),

  invoiceItemDescription: z.string().min(1, "Description is required."),
  invoiceItemQuantity: z.number().min(1, "Quantity minimum 1)"),
  invoiceItemRate: z.number().min(1, "Rate minimum 1"),
});
