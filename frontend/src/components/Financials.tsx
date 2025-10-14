import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import {
  Trash2,
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  status: "completed" | "pending" | "cancelled";
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export function Financials() {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      date: "2025-10-10",
      description: "Product Sales",
      amount: 5000,
      type: "income",
      category: "Sales",
      status: "completed",
    },
    {
      id: "2",
      date: "2025-10-09",
      description: "Office Rent",
      amount: 2000,
      type: "expense",
      category: "Operations",
      status: "completed",
    },
    {
      id: "3",
      date: "2025-10-08",
      description: "Marketing Campaign",
      amount: 1500,
      type: "expense",
      category: "Marketing",
      status: "completed",
    },
  ]);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "income" as "income" | "expense",
    category: "",
  });

  const addTransaction = () => {
    if (
      !newTransaction.description ||
      !newTransaction.amount ||
      !newTransaction.category
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: newTransaction.date,
      description: newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      type: newTransaction.type,
      category: newTransaction.category,
      status: "completed",
    };

    setTransactions([transaction, ...transactions]);
    setNewTransaction({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      type: "income",
      category: "",
    });
    toast.success("Transaction added successfully!");
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast.success("Transaction deleted");
  };

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  // Category breakdown for pie chart
  const categoryData = transactions.reduce((acc, t) => {
    const existing = acc.find((item) => item.category === t.category);
    if (existing) {
      existing.value += t.amount;
    } else {
      acc.push({ category: t.category, value: t.amount });
    }
    return acc;
  }, [] as { category: string; value: number }[]);

  // Monthly trend data
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleDateString("en-US", {
      month: "short",
    });
    const existing = acc.find((item) => item.month === month);
    if (existing) {
      if (t.type === "income") {
        existing.income += t.amount;
      } else {
        existing.expenses += t.amount;
      }
    } else {
      acc.push({
        month,
        income: t.type === "income" ? t.amount : 0,
        expenses: t.type === "expense" ? t.amount : 0,
      });
    }
    return acc;
  }, [] as { month: string; income: number; expenses: number }[]);

  return (
    <Tabs defaultValue='overview' className='w-full'>
      <TabsList className='grid w-full grid-cols-3 bg-gray-600'>
        <TabsTrigger value='overview'>Overview</TabsTrigger>
        <TabsTrigger value='transactions'>Transactions</TabsTrigger>
        <TabsTrigger value='reports'>Reports</TabsTrigger>
      </TabsList>

      <TabsContent value='overview' className='mt-6 space-y-6'>
        <div className='grid grid-cols-3 gap-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm'>Total Income</CardTitle>
              <TrendingUp className='h-4 w-4 income-text' />
            </CardHeader>
            <CardContent>
              <div className='income-text'>${totalIncome.toLocaleString()}</div>
              <p className='text-xs text-muted-foreground mt-1'>All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm'>Total Expenses</CardTitle>
              <TrendingDown className='h-4 w-4 expense-text' />
            </CardHeader>
            <CardContent>
              <div className='expense-text'>
                ${totalExpenses.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm'>Net Profit</CardTitle>
              <DollarSign className='h-4 w-4 text-primary' />
            </CardHeader>
            <CardContent>
              <div className={netProfit >= 0 ? "income-text" : "expense-text"}>
                ${netProfit.toLocaleString()}
              </div>
              <p className='text-xs text-muted-foreground mt-1'>All time</p>
            </CardContent>
          </Card>
        </div>

        <div className='grid grid-cols-2 gap-6'>
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>Monthly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='hsl(var(--border))'
                  />
                  <XAxis
                    dataKey='month'
                    stroke='hsl(var(--muted-foreground))'
                  />
                  <YAxis stroke='hsl(var(--muted-foreground))' />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Bar dataKey='income' fill='#10b981' name='Income' />
                  <Bar dataKey='expenses' fill='#f43f5e' name='Expenses' />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Category breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey='value'
                    nameKey='category'
                    cx='50%'
                    cy='50%'
                    outerRadius={100}
                    label
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {transactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className='flex items-center justify-between py-3 border-b border-border last:border-0'
                >
                  <div>
                    <div className='text-primary-content'>
                      {transaction.description}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {transaction.category}
                    </div>
                  </div>
                  <div className='text-right'>
                    <div
                      className={
                        transaction.type === "income"
                          ? "income-text"
                          : "expense-text"
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}$
                      {transaction.amount.toLocaleString()}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='transactions' className='mt-6 space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
            <CardDescription>Record a new income or expense</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='date'>Date</Label>
                <Input
                  id='date'
                  type='date'
                  value={newTransaction.date}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='type'>Type</Label>
                <Select
                  value={newTransaction.type}
                  onValueChange={(value: "income" | "expense") =>
                    setNewTransaction({ ...newTransaction, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='income'>Income</SelectItem>
                    <SelectItem value='expense'>Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Input
                  id='description'
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  placeholder='e.g., Product Sales'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='amount'>Amount</Label>
                <Input
                  id='amount'
                  type='number'
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                  placeholder='0.00'
                />
              </div>
              <div className='space-y-2 col-span-2'>
                <Label htmlFor='category'>Category</Label>
                <Input
                  id='category'
                  value={newTransaction.category}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      category: e.target.value,
                    })
                  }
                  placeholder='e.g., Sales, Marketing, Operations'
                />
              </div>
            </div>
            <Button onClick={addTransaction} className='mt-4'>
              <Plus className='mr-2 h-4 w-4' />
              Add Transaction
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Transactions ({transactions.length})</CardTitle>
            <CardDescription>
              View and manage all financial transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                No transactions yet. Add your first transaction above.
              </div>
            ) : (
              <div className='border rounded-lg overflow-hidden'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='w-[100px]'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.type === "income"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={
                            transaction.type === "income"
                              ? "income-text"
                              : "expense-text"
                          }
                        >
                          {transaction.type === "income" ? "+" : "-"}$
                          {transaction.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              transaction.status === "completed"
                                ? "default"
                                : transaction.status === "pending"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => deleteTransaction(transaction.id)}
                          >
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='reports' className='mt-6 space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Comprehensive financial overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex justify-between py-3 border-b border-border'>
                <span className='text-secondary-content'>Total Income</span>
                <span className='income-text'>
                  ${totalIncome.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between py-3 border-b border-border'>
                <span className='text-secondary-content'>Total Expenses</span>
                <span className='expense-text'>
                  ${totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between py-3 border-b border-border'>
                <span className='text-secondary-content'>Net Profit/Loss</span>
                <span
                  className={netProfit >= 0 ? "income-text" : "expense-text"}
                >
                  ${netProfit.toLocaleString()}
                </span>
              </div>
              <div className='flex justify-between py-3 border-b border-border'>
                <span className='text-secondary-content'>
                  Average Transaction
                </span>
                <span className='text-primary-content'>
                  $
                  {transactions.length > 0
                    ? (
                        transactions.reduce((sum, t) => sum + t.amount, 0) /
                        transactions.length
                      ).toFixed(2)
                    : 0}
                </span>
              </div>
              <div className='flex justify-between py-3'>
                <span className='text-secondary-content'>
                  Total Transactions
                </span>
                <span className='text-primary-content'>
                  {transactions.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Trend Analysis</CardTitle>
            <CardDescription>
              Income and expense trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid
                  strokeDasharray='3 3'
                  stroke='hsl(var(--border))'
                />
                <XAxis dataKey='month' stroke='hsl(var(--muted-foreground))' />
                <YAxis stroke='hsl(var(--muted-foreground))' />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='income'
                  stroke='#10b981'
                  strokeWidth={2}
                />
                <Line
                  type='monotone'
                  dataKey='expenses'
                  stroke='#f43f5e'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Detailed spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {categoryData.map((item, index) => (
                <div key={item.category} className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-secondary-content'>
                      {item.category}
                    </span>
                    <span className='text-primary-content'>
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                  <div className='w-full bg-muted rounded-full h-2'>
                    <div
                      className='h-2 rounded-full'
                      style={{
                        width: `${
                          (item.value / (totalIncome + totalExpenses)) * 100
                        }%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
