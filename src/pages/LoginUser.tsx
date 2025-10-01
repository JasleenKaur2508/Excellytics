import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMockAuth } from "@/context/MockAuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Chrome } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const LoginUser = () => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loading } = useMockAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: ""
  });
  const [error, setError] = useState("");

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      setError("Failed to sign in with Google");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      if (isSignUp) {
        await signUpWithEmail(formData.email, formData.password, formData.displayName);
      } else {
        await signInWithEmail(formData.email, formData.password);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please try again.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Create an account' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Enter your information to create an account' 
              : 'Enter your email and password to sign in'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-red-500 text-sm text-center p-2 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!isSignUp && (
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full" 
              onClick={handleGoogle}
              disabled={loading}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>
          </CardContent>
        </form>
        
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <Button 
              type="button" 
              variant="link" 
              className="px-1.5 h-auto"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginUser;