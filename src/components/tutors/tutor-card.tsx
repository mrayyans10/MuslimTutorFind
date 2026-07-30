import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  Monitor,
  Star,
  Users,
} from "lucide-react";

import { DEFAULT_CURRENCY } from "@config/product";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export type TutorCardData = {
  id: string;
  slug: string;
  displayName: string;
  headline: string;
  photoUrl?: string | null;
  subjects: string[];
  location?: string | null;
  onlineAvailable: boolean;
  inPersonAvailable: boolean;
  hourlyRate: number;
  currency?: string;
  averageRating: number;
  reviewCount: number;
  isVerified: boolean;
  bio: string;
};

export interface TutorCardProps {
  tutor: TutorCardData;
  messageHref?: string;
  profileHref?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatModes(online: boolean, inPerson: boolean) {
  if (online && inPerson) return "Online & in-person";
  if (online) return "Online";
  if (inPerson) return "In-person";
  return "Mode not listed";
}

export function TutorCard({ tutor, messageHref, profileHref }: TutorCardProps) {
  const currency = tutor.currency ?? DEFAULT_CURRENCY;
  const profileLink = profileHref ?? `/tutors/${tutor.slug}`;
  const messageLink = messageHref ?? `/messages/new?tutor=${tutor.id}`;

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row gap-4 space-y-0 p-5">
        <Avatar className="size-16">
          <AvatarImage src={tutor.photoUrl ?? undefined} alt={tutor.displayName} />
          <AvatarFallback className="text-base">
            {getInitials(tutor.displayName)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-display text-lg font-semibold text-foreground">
              {tutor.displayName}
            </h3>
            {tutor.isVerified ? (
              <Badge variant="accent" className="gap-1">
                <BadgeCheck className="size-3" />
                Verified
              </Badge>
            ) : null}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {tutor.headline}
          </p>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-5">
        <div className="flex flex-wrap gap-2">
          {tutor.subjects.slice(0, 4).map((subject) => (
            <Badge key={subject} variant="secondary">
              {subject}
            </Badge>
          ))}
          {tutor.subjects.length > 4 ? (
            <Badge variant="muted">+{tutor.subjects.length - 4} more</Badge>
          ) : null}
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground">
          {tutor.location ? (
            <div className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span className="truncate">{tutor.location}</span>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            {tutor.onlineAvailable ? (
              <Monitor className="size-4 shrink-0 text-primary" />
            ) : (
              <Users className="size-4 shrink-0 text-primary" />
            )}
            <span>{formatModes(tutor.onlineAvailable, tutor.inPersonAvailable)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="font-display text-xl font-semibold text-primary">
            {formatCurrency(tutor.hourlyRate, currency)}
            <span className="text-sm font-normal text-muted-foreground"> /hr</span>
          </p>
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-amber text-amber" />
            <span className="font-medium text-foreground">
              {tutor.averageRating.toFixed(1)}
            </span>
            <span className="text-muted-foreground">
              ({tutor.reviewCount})
            </span>
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {tutor.bio}
        </p>
      </CardContent>

      <CardFooter className="mt-auto gap-2 border-t border-border bg-secondary/30 p-5">
        <Button variant="outline" className="flex-1" asChild>
          <Link href={messageLink}>Message</Link>
        </Button>
        <Button className="flex-1" asChild>
          <Link href={profileLink}>View profile</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
