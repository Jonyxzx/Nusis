import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import api from "@/lib/api";

export interface Recipient {
  name: string;
  email: string;
}

interface EmailRecipientsProps {
  recipients: Recipient[];
  onRecipientsChange: (recipients: Recipient[]) => void;
}

export function EmailRecipients({
  recipients,
  onRecipientsChange,
}: EmailRecipientsProps) {
  const [allRecipients, setAllRecipients] = useState<Recipient[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setSelectedRecipients(recipients);
  }, [recipients]);

  useEffect(() => {
    api
      .get("/v1/recipients")
      .then((res) => {
        const data = res.data || [];
        if (Array.isArray(data)) {
          const sorted = data.sort((a, b) =>
            (a.name || "").localeCompare(b.name || "")
          );
          setAllRecipients(sorted);
        }
      })
      .catch(() => {});
  }, []);

  const totalPages = Math.ceil(allRecipients.length / pageSize);
  const start = (currentPage - 1) * pageSize;
  const paginated = allRecipients.slice(start, start + pageSize);

  const allSelected =
    paginated.length > 0 &&
    paginated.every((r) => selectedRecipients.some((s) => s.email === r.email));

  const handleSelectAllPage = (checked: boolean) => {
    let newSelected: Recipient[];
    if (checked) {
      newSelected = [
        ...selectedRecipients,
        ...paginated.filter(
          (r) => !selectedRecipients.some((s) => s.email === r.email)
        ),
      ];
    } else {
      newSelected = selectedRecipients.filter(
        (s) => !paginated.some((r) => r.email === s.email)
      );
    }
    setSelectedRecipients(newSelected);
    onRecipientsChange(newSelected);
  };

  const handleSelectAllGlobal = () => {
    const newSelected = [...allRecipients];
    setSelectedRecipients(newSelected);
    onRecipientsChange(newSelected);
  };

  const handleUnselectAllGlobal = () => {
    const newSelected: Recipient[] = [];
    setSelectedRecipients(newSelected);
    onRecipientsChange(newSelected);
  };

  const handleSelect = (recipient: Recipient, checked: boolean) => {
    let newSelected;
    if (checked) {
      newSelected = [...selectedRecipients, recipient];
    } else {
      newSelected = selectedRecipients.filter(
        (s) => s.email !== recipient.email
      );
    }
    setSelectedRecipients(newSelected);
    onRecipientsChange(newSelected);
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>
            Recipients ({selectedRecipients.length} selected)
          </CardTitle>
          <CardDescription>Select recipients for your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex gap-2'>
            <Button
              onClick={handleSelectAllGlobal}
              disabled={selectedRecipients.length === allRecipients.length}
              variant='outline'
              size='sm'
            >
              Select All Recipients
            </Button>
            <Button
              onClick={handleUnselectAllGlobal}
              disabled={selectedRecipients.length === 0}
              variant='outline'
              size='sm'
            >
              Unselect All Recipients
            </Button>
          </div>
          {allRecipients.length === 0 ? (
            <div className='text-center py-8 text-secondary-content'>
              Loading recipients...
            </div>
          ) : (
            <>
              <div className='data-table'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4">
                        <input
                          type='checkbox'
                          checked={allSelected}
                          onChange={(e) =>
                            handleSelectAllPage(e.target.checked)
                          }
                        />
                      </TableHead>
                      <TableHead className="px-4">Name</TableHead>
                      <TableHead className="px-4">Email</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.map((recipient) => (
                      <TableRow key={recipient.email} className='py-4'>
                        <TableCell className="px-4">
                          <input
                            type='checkbox'
                            checked={selectedRecipients.some(
                              (s) => s.email === recipient.email
                            )}
                            onChange={(e) =>
                              handleSelect(recipient, e.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell className="px-4">{recipient.name}</TableCell>
                        <TableCell className="px-4">{recipient.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className='flex justify-between items-center mt-4'>
                <div>
                  Page {currentPage} of {totalPages}
                </div>
                <div>
                  <Button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant='outline'
                    size='sm'
                  >
                    Prev
                  </Button>
                  <Button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    variant='outline'
                    size='sm'
                    className='ml-2'
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Selected Recipients ({selectedRecipients.length})
          </CardTitle>
          <CardDescription>Recipients chosen for the campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedRecipients.length === 0 ? (
            <p>No recipients selected.</p>
          ) : (
            <ul className='list-disc list-inside'>
              {selectedRecipients.map((r) => (
                <li key={r.email}>
                  {r.name} ({r.email})
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
