import React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Login from "./Login"
import Signup from "./Signup"

const Auth = () => {
  const [tab, setTab] = React.useState("login")

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-[400px]">
      <TabsList className="w-full">
        <TabsTrigger value="login" className="w-full">Login</TabsTrigger>
        <TabsTrigger value="signup" className="w-full">Signup</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Login onSwitchToSignup={() => setTab("signup")} />
      </TabsContent>
      <TabsContent value="signup">
        <Signup onSwitchToLogin={() => setTab("login")} />
      </TabsContent>
    </Tabs>
  );
};

export default Auth;