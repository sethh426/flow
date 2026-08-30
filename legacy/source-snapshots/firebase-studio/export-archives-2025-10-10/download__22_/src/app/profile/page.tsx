
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCog } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl text-primary flex items-center gap-2">
        <UserCog className="h-8 w-8" />
        Profile
      </h1>
        <Card>
            <CardHeader>
                <CardTitle>Authentication Disabled</CardTitle>
                <CardDescription>
                    User profiles and sign-in functionality have been removed from this application.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 bg-muted/50 rounded-lg border-dashed border">
                    <UserCog className="h-12 w-12 mb-4" />
                    <p>There is no user profile information to display.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
