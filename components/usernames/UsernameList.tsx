"use client";

import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useScout } from "@/hooks/useScout";

export function UsernameList() {
  const { usernames, lookupPlayers, isProcessing } = useScout();

  if (usernames.length === 0) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Detected Usernames</CardTitle>
        <CardDescription>
          {usernames.length} candidate{usernames.length === 1 ? "" : "s"}{" "}
          extracted from OCR output.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="flex flex-wrap gap-2">
          {usernames.map((username) => (
            <li key={username}>
              <Badge variant="secondary">{username}</Badge>
            </li>
          ))}
        </ul>
        <Button
          className="w-full"
          onClick={lookupPlayers}
          disabled={isProcessing}
        >
          <Search data-icon="inline-start" />
          Look Up Stats
        </Button>
      </CardContent>
    </Card>
  );
}
