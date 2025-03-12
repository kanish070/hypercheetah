import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserIcon, Car, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Zap className="h-10 w-10 text-primary" />
            </motion.div>
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
              HyperCheetah
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Lightning-fast rides with smart route matching
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <UserIcon className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-semibold mb-3">Passenger Mode</h2>
                <p className="text-muted-foreground mb-6">
                  Find rides along your route and save on travel costs
                </p>
                <Button
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                  size="lg"
                  onClick={() => setLocation("/passenger")}
                >
                  Ride as Passenger
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Car className="h-12 w-12 text-primary" />
                  </motion.div>
                </div>
                <h2 className="text-2xl font-semibold mb-3">Rider Mode</h2>
                <p className="text-muted-foreground mb-6">
                  Offer rides and share your journey with others
                </p>
                <Button
                  className="w-full transition-transform duration-300 group-hover:scale-105"
                  size="lg"
                  onClick={() => setLocation("/rider")}
                >
                  Drive as Rider
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}