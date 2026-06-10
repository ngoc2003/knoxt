import { useQuery } from "@apollo/client/react";
import { ArrowLeft, Building2, Mail, Phone } from "lucide-react";
import { Link, useParams } from "react-router";
import { Card } from "@/shared/ui/card";
import { CUSTOMER_DETAIL_QUERY } from "../graphql/customer";

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status: string;
}

export function CustomerDetail() {
  const { id } = useParams();
  const { data, loading, error } = useQuery(CUSTOMER_DETAIL_QUERY, {
    variables: { id: id ?? "" },
    skip: !id,
  });
  const customer = (data as { customerDetail?: Customer })?.customerDetail;

  if (loading)
    return <div className="p-6 text-sm text-gray-600">Loading...</div>;
  if (error || !customer) {
    return <div className="p-6 text-sm text-red-600">Customer not found.</div>;
  }

  return (
    <div className="p-6">
      <Link
        to="/customers"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600"
      >
        <ArrowLeft className="size-4" />
        Back to customers
      </Link>
      <Card className="max-w-2xl border border-gray-200 bg-white p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {customer.name}
          </h1>
          <p className="mt-1 text-sm capitalize text-gray-600">
            {customer.status}
          </p>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center gap-3">
            <Building2 className="size-4 text-gray-400" />
            <span>{customer.company || "No company"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="size-4 text-gray-400" />
            <span>{customer.email || "No email"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="size-4 text-gray-400" />
            <span>{customer.phone || "No phone"}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
