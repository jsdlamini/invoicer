"use server";

import { requireUser } from "./utils/hooks";
import { parseWithZod } from "@conform-to/zod";
import { invoiceSchema, onboardingSchema } from "./utils/zodShemas";
import prisma from "./utils/db";
import { redirect } from "next/navigation";
import { emailClient } from "./utils/mailtrap";
import { formatCurrency } from "./utils/formatCurrency";

export async function onboardUser(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: onboardingSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.user.update({
    where: {
      id: session.user?.id,
    },
    data: {
      firstName: submission.value.firstName,
      lastName: submission.value.lastName,
      address: submission.value.address,
    },
  });

  return redirect("/dashboard");
}

export async function createInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, {
    schema: invoiceSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.invoice.create({
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromName: submission.value.fromName,
      fromEmail: submission.value.fromEmail,
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
      userId: session.user?.id,
    },
  });

  const sender = {
    email: "marketing@idealsoftwaresolutions.com",
    name: "Ideal Software Solutions",
  };

  emailClient
    .send({
      from: sender,
      to: [{ email: submission.value.clientEmail }],
      template_uuid: "7273014d-4439-46c4-b868-e23eefe57534",
      template_variables: {
        clientName: submission.value.clientName,
        invoiceNumber: submission.value.invoiceNumber,
        dueDate: new Intl.DateTimeFormat("en-US", {
          dateStyle: "long",
        }).format(new Date(submission.value.date)),
        totalAmount: formatCurrency({
          amount: submission.value.total,
          currency: submission.value.currency as any,
        }),
        invoiceLink:
          process.env.NODE_ENV !== "production"
            ? `http://localhost:3000/api/invoice/${data.id}`
            : `https://invoicer-e7r3lke97-jsdlaminis-projects.vercel.app/api/invoice/${data.id}`,
      },
    })
    .then(console.log, console.error);

  return redirect("/dashboard/invoices");
}

export async function editInvoice(prevState: any, formData: FormData) {
  const session = await requireUser();

  const submission = parseWithZod(formData, { schema: invoiceSchema });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const data = await prisma.invoice.update({
    where: {
      id: formData.get("id") as string,
      userId: session.user?.id,
    },
    data: {
      clientAddress: submission.value.clientAddress,
      clientEmail: submission.value.clientEmail,
      clientName: submission.value.clientName,
      currency: submission.value.currency,
      date: submission.value.date,
      dueDate: submission.value.dueDate,
      fromAddress: submission.value.fromAddress,
      fromEmail: submission.value.fromEmail,
      fromName: submission.value.fromName,
      invoiceItemDescription: submission.value.invoiceItemDescription,
      invoiceItemQuantity: submission.value.invoiceItemQuantity,
      invoiceItemRate: submission.value.invoiceItemRate,
      invoiceName: submission.value.invoiceName,
      invoiceNumber: submission.value.invoiceNumber,
      status: submission.value.status,
      total: submission.value.total,
      note: submission.value.note,
    },
  });

  const sender = {
    email: "marketing@idealsoftwaresolutions.com",
    name: "Ideal Software Solutions",
  };

  emailClient
    .send({
      from: sender,
      to: [{ email: submission.value.clientEmail }],
      template_uuid: "aed7c3fd-bc7f-4fdd-a5f7-d20ed0b8d0ac",
      template_variables: {
        clientName: submission.value.clientName,
        invoiceNumber: submission.value.invoiceNumber,
        dueDate: new Intl.DateTimeFormat("en-US", {
          dateStyle: "long",
        }).format(new Date(submission.value.date)),
        totalAmount: formatCurrency({
          amount: submission.value.total,
          currency: submission.value.currency as any,
        }),
        invoiceLink:
          process.env.NODE_ENV !== "production"
            ? `http://localhost:3000/api/invoice/${data.id}`
            : `https://invoicer-e7r3lke97-jsdlaminis-projects.vercel.app/api/invoice/${data.id}`,
      },
    })
    .then(console.log, console.error);

  return redirect("/dashboard/invoices");
}

export default async function DeleteInvoice(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.delete({
    where: {
      userId: session.user?.id,
      id: invoiceId,
    },
  });

  return redirect("/dashboard/invoices");
}

export async function MarkAsPaidAction(invoiceId: string) {
  const session = await requireUser();

  const data = await prisma.invoice.update({
    where: {
      userId: session.user?.id,
      id: invoiceId,
    },
    data: {
      status: "PAID",
    },
  });

  return redirect("/dashboard/invoices");
}
