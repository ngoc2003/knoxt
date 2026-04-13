import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";
import {
  LIST_CUSTOMERS_QUERY,
  CREATE_CUSTOMER_MUTATION,
} from "../../graphql/customer";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "../ui/command";

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
}

interface CustomerSelectProps {
  value: string;
  onChange: (value: string, customerObj?: Customer | null) => void;
  placeholder?: string;
}

export function CustomerSelect({
  value,
  onChange,
  placeholder,
}: CustomerSelectProps) {
  const [input, setInput] = useState(value);
  const [showList, setShowList] = useState(false);
  const { data } = useQuery(LIST_CUSTOMERS_QUERY, {
    variables: { filter: { search: input }, pagination: { skip: 0, take: 10 } },
    fetchPolicy: "network-only",
  });
  const [createCustomer] = useMutation(CREATE_CUSTOMER_MUTATION);
  const customers: Customer[] = data?.listCustomers?.items || [];

  useEffect(() => {
    setInput(value);
  }, [value]);

  const handleSelect = (customer: Customer) => {
    onChange(customer.name, customer);
    setShowList(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setShowList(true);
  };

  const handleBlur = () => {
    setTimeout(() => setShowList(false), 150); // allow click
  };

  const handleCreate = async () => {
    const res = await createCustomer({ variables: { data: { name: input } } });
    const newCustomer = res.data?.createCustomer;
    if (newCustomer) {
      onChange(newCustomer.name, newCustomer);
    }
    setShowList(false);
  };

  const match = customers.find(
    (c) => c.name.toLowerCase() === input.toLowerCase(),
  );

  return (
    <div className="relative">
      <Input
        value={input}
        onChange={handleInputChange}
        onFocus={() => setShowList(true)}
        onBlur={handleBlur}
        placeholder={placeholder || "Select or type customer..."}
        autoComplete="off"
      />
      {showList && (
        <div className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full mt-1 max-h-60 overflow-auto">
          <Command>
            <CommandInput value={input} onValueChange={setInput} />
            <CommandList>
              {customers.length === 0 && (
                <CommandEmpty>No customers found</CommandEmpty>
              )}
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  onSelect={() => handleSelect(customer)}
                  className="cursor-pointer hover:bg-gray-100 px-3 py-2"
                >
                  {customer.name}{" "}
                  <span className="text-xs text-gray-400 ml-2">
                    {customer.company}
                  </span>
                </CommandItem>
              ))}
              {!match && input.trim() && (
                <CommandItem
                  onSelect={handleCreate}
                  className="cursor-pointer text-blue-600 hover:bg-blue-50 px-3 py-2"
                >
                  + Create "{input}"
                </CommandItem>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
