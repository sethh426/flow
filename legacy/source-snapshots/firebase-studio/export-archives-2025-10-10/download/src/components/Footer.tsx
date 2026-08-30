export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border py-6 text-center">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AffiliateFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
