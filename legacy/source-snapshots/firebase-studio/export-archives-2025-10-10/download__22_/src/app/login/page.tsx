
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/30">
        <Card className="w-full max-w-sm shadow-2xl border-primary/20">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit border border-primary/20">
                    <LogIn className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-headline text-primary">Authentication Disabled</CardTitle>
                <CardDescription>The sign-in functionality has been removed to simplify access for this demo.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-4 bg-muted/50 rounded-lg">
                    <p>You can now access all application features without signing in.</p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
