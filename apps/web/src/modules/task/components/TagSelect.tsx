import { useEffect, useState } from "react";
import { Input } from "../../../shared/ui/input";
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "../../../shared/ui/command";

interface SelectComponentProps<T> {
  value: string[];
  onChange: (value: string[], selectedItems?: T[] | null) => void;
  onSubmit: (input: string) => Promise<T | null>;
  data: T[];
  placeholder?: string;
  filterData: (data: T[], input: string) => T[];
  renderItem: (item: T, onSelect: () => void) => React.ReactNode;
}

export function TagSelect<T>({
  value,
  onChange,
  onSubmit,
  data,
  placeholder,
  filterData,
  renderItem,
}: SelectComponentProps<T>) {
  const [input, setInput] = useState("");
  const [showList, setShowList] = useState(false);

  const handleSelect = (item: T) => {
    const itemName = (item as any).name;
    if (!value.includes(itemName)) {
      onChange(
        [...value, itemName],
        [...data.filter((d) => value.includes((d as any).name)), item],
      );
    }
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
    const newItem = await onSubmit(input);
    if (newItem) {
      const itemName = (newItem as any).name; // Assuming T has a name property
      onChange(
        [...value, itemName],
        [...data.filter((d) => value.includes((d as any).name)), newItem],
      );
    }
    setShowList(false);
  };

  const filteredData = filterData(data, input);
  const match = filteredData.find(
    (item) => (item as any).name.toLowerCase() === input.toLowerCase(),
  );

  return (
    <div className="relative">
      <Input
        value={input}
        onChange={handleInputChange}
        onFocus={() => setShowList(true)}
        onBlur={handleBlur}
        placeholder={placeholder || "Select or type..."}
        autoComplete="off"
      />
      {showList && (
        <div className="absolute z-10 bg-white border border-gray-200 rounded shadow w-full mt-1 max-h-60 overflow-auto">
          <Command>
            <CommandInput value={input} onValueChange={setInput} />
            <CommandList>
              {filteredData.length === 0 && (
                <CommandEmpty>No items found</CommandEmpty>
              )}
              {filteredData.map((item) => (
                <CommandItem
                  key={(item as any).id}
                  onSelect={() => handleSelect(item)}
                  className="cursor-pointer hover:bg-gray-100 px-3 py-2"
                >
                  {renderItem(item, () => handleSelect(item))}
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
