"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SearchPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Advanced Search</h2>
        <p className="text-muted-foreground">
          Search your emails with precise filters
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
          <CardDescription>
            Use filters to find specific emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Keywords</label>
            <Input placeholder="Enter search terms..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">From</label>
              <Input placeholder="sender@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium">To</label>
              <Input placeholder="recipient@example.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">After Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium">Before Date</label>
              <Input type="date" />
            </div>
          </div>
          <Button className="w-full">Search</Button>
        </CardContent>
      </Card>
    </div>
  );
}
