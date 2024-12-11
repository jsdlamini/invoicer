import prisma from "@/app/utils/db";
import { requireUser } from "@/app/utils/hooks";
import { emailClient } from "@/app/utils/mailtrap";
import { NextResponse } from "next/server";
import React from "react";

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ invoiceId: string }>;
  }
) {
  try {
    const session = await requireUser();
    const { invoiceId } = await params;

    const invoiceData = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        userId: session.user?.id,
      },
    });

    if (!invoiceData) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const sender = {
      email: "marketing@idealsoftwaresolutions.com",
      name: "Ideal Software Solutions",
    };

    emailClient
      .send({
        from: sender,
        to: [{ email: invoiceData.clientEmail }],
        template_uuid: "faac0901-7328-4230-97ad-3ceca243eed9",
        template_variables: {
          first_name: invoiceData.clientName,
          company_info_name: "Ideal Software Solutions",
          company_info_address: "Manzini",
          company_info_city: "Manzini",
          company_info_zip_code: "M200",
          company_info_country: "Eswatini",
        },

        // invoiceLink: `http://localhost:3000/api/invoice/${data.id}`,
      })
      .then(console.log, console.error);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to send email reminder" },
      { status: 500 }
    );
  }
}
