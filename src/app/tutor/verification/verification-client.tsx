"use client";

import { useActionState } from "react";

import { uploadVerificationDocumentAction, type ActionState } from "@/app/actions/dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Document = {
  id: string;
  type: string;
  fileName: string;
  uploadedAt: Date;
};

type Verification = {
  status: string;
  notes: string | null;
  rejectionReason: string | null;
  documents: Document[];
} | null;

const initialState: ActionState = {};

export function VerificationClient({ verification }: { verification: Verification }) {
  const [state, formAction, pending] = useActionState(uploadVerificationDocumentAction, initialState);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Verification status</CardTitle>
          <Badge>{verification?.status ?? "NOT_SUBMITTED"}</Badge>
        </CardHeader>
        <CardContent className="space-y-2">
          {verification?.notes ? <p className="text-sm">{verification.notes}</p> : null}
          {verification?.rejectionReason ? (
            <p className="text-sm text-destructive">{verification.rejectionReason}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Upload document</CardTitle></CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state.message ? (
              <p className={state.success ? "text-sm text-green-600" : "text-sm text-destructive"}>
                {state.message}
              </p>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="documentType">Document type</Label>
              <Select id="documentType" name="documentType" defaultValue="GOVERNMENT_ID">
                <option value="GOVERNMENT_ID">Government ID</option>
                <option value="DEGREE">Degree</option>
                <option value="CERTIFICATION">Certification</option>
                <option value="RESUME">Resume</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">File (PDF, image — max 10MB)</Label>
              <Input id="file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" required />
            </div>
            <Button type="submit" disabled={pending}>Upload</Button>
          </form>
        </CardContent>
      </Card>

      {verification?.documents.length ? (
        <Card>
          <CardHeader><CardTitle>Uploaded documents</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {verification.documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{doc.fileName}</p>
                  <p className="text-xs text-muted-foreground">{doc.type}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(doc.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
