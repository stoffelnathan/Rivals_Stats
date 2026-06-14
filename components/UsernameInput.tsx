"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseUsernames } from "@/utils/parseUsernames";

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (usernames: string[]) => void;
  isLoading: boolean;
}

export function UsernameInput({
  value,
  onChange,
  onSubmit,
  isLoading,
}: UsernameInputProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const usernames = parseUsernames(value);
    if (usernames.length === 0) return;
    onSubmit(usernames);
  }

  const parsedCount = parseUsernames(value).length;

  return (
    <Card className="scout-card border-[#38d9f5]/30 ring-0">
      <CardHeader>
        <CardTitle className="scout-section-title text-lg">
          Enter Player Names
        </CardTitle>
        <CardDescription className="scout-subtitle">
          One username for a solo scout, or several for a team lobby breakdown.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="usernames">Usernames</Label>
            <Textarea
              id="usernames"
              value={value}
              onChange={(event) => onChange(event.target.value)}
              placeholder={"PlayerOne\nPlayerTwo\nPlayerThree"}
              rows={5}
              className="scout-input min-h-32 resize-y font-mono text-sm"
            />
            {parsedCount > 0 && (
              <p className="scout-count-text text-sm">
                {parsedCount} player{parsedCount === 1 ? "" : "s"} ready
                {parsedCount > 1 ? " · team mode" : ""}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="scout-btn-primary"
            disabled={isLoading || parsedCount === 0}
          >
            <Search data-icon="inline-start" />
            {isLoading ? "Looking up…" : "Look Up Stats"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
