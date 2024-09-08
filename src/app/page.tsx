"use client";

import React, { useState, useEffect } from "react";
import { ChromePicker } from "react-color";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Target, User } from "lucide-react";
import { Input } from "@/components/ui/input";

interface IconProps {
  className?: string;
}

const ProgressBar = ({ duration }: { duration: number }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prevProgress - (100 / duration) * 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
      <motion.div
        className="bg-blue-600 h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
        initial={{ width: "100%" }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

const ColorResult = ({
  label,
  color,
  icon: Icon,
}: {
  label: string;
  color: string;
  icon: React.ComponentType<IconProps>;
}) => (
  <div className="flex flex-col items-center space-y-2">
    <div className="text-sm font-medium">{label}</div>
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-white shadow-lg" style={{ backgroundColor: color }} />
      <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md">
        <Icon className="w-6 h-6" />
      </div>
    </div>
    <div className="text-xs font-mono mt-1">{color}</div>
  </div>
);

export default function ColorPickingGame() {
  const [targetColor, setTargetColor] = useState<string>("");
  const [showTarget, setShowTarget] = useState<boolean>(false);
  const [player1Color, setPlayer1Color] = useState<string>("#ffffff");
  const [player2Color, setPlayer2Color] = useState<string>("#ffffff");
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);
  const [player1Name, setPlayer1Name] = useState<string>("");
  const [player2Name, setPlayer2Name] = useState<string>("");
  const [showNameInput, setShowNameInput] = useState<boolean>(true);
  const [player1RoundScore, setPlayer1RoundScore] = useState<number>(0);
  const [player2RoundScore, setPlayer2RoundScore] = useState<number>(0);
  const [round, setRound] = useState<number>(0);
  const [gameState, setGameState] = useState<string>("waiting"); // 'waiting', 'showing', 'picking', 'results'
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  console.log(showTarget);

  const generateRandomColor = () => {
    return (
      "#" +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")
    );
  };

  const startGame = () => {
    if (player1Name && player2Name) {
      setShowNameInput(false);
      setGameState("waiting");
    }
  };

  const startRound = () => {
    const newTargetColor = generateRandomColor();
    setTargetColor(newTargetColor);
    setShowTarget(true);
    setGameState("showing");
    setShowInstructions(false);

    setTimeout(() => {
      setShowTarget(false);
      setGameState("picking");
    }, 5000);
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return [r, g, b];
  };

  const calculateColorDistance = (color1: string, color2: string) => {
    const [r1, g1, b1] = hexToRgb(color1);
    const [r2, g2, b2] = hexToRgb(color2);
    return Math.sqrt(Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2));
  };

  const endRound = () => {
    const distance1 = calculateColorDistance(targetColor, player1Color);
    const distance2 = calculateColorDistance(targetColor, player2Color);

    let newPlayer1RoundScore = 0;
    let newPlayer2RoundScore = 0;

    if (distance1 < distance2) {
      newPlayer1RoundScore += 1;
      newPlayer1RoundScore += Math.max(0, 5 - Math.floor(distance1 / 10));
    } else if (distance2 < distance1) {
      newPlayer2RoundScore += 1;
      newPlayer2RoundScore += Math.max(0, 5 - Math.floor(distance2 / 10));
    } else {
      newPlayer1RoundScore += 0.5;
      newPlayer2RoundScore += 0.5;
    }

    setPlayer1RoundScore(newPlayer1RoundScore);
    setPlayer2RoundScore(newPlayer2RoundScore);
    setPlayer1Score(player1Score + newPlayer1RoundScore);
    setPlayer2Score(player2Score + newPlayer2RoundScore);
    setRound(round + 1);
    setGameState("results");
  };

  return (
    <div className="container mx-auto p-4">
      <motion.h1
        className="text-3xl font-bold mb-4 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Color Picking Game
      </motion.h1>
      <div className="flex justify-center mb-4">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {showNameInput ? "Enter Player Names" : `Round ${round + 1}`}
              {!showNameInput && (
                <Button variant="ghost" size="sm" onClick={() => setShowInstructions(!showInstructions)}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Instructions
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {showNameInput && (
                <motion.div
                  key="nameInput"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Input
                    placeholder="Player 1 Name"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                  />
                  <Input
                    placeholder="Player 2 Name"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                  />
                  <Button onClick={startGame} className="w-full" disabled={!player1Name || !player2Name}>
                    Start Game
                  </Button>
                </motion.div>
              )}
              {!showNameInput && (
                <>
                  {showInstructions && (
                    <motion.div
                      key="instructions"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-secondary p-4 rounded-md mb-4"
                    >
                      <h3 className="font-bold mb-2">How to Play:</h3>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>A random color will be shown for 5 seconds.</li>
                        <li>Try to remember the color.</li>
                        <li>After the color disappears, each player tries to recreate it.</li>
                        <li>The player closest to the original color wins the round.</li>
                        <li>Additional points are awarded based on accuracy.</li>
                      </ol>
                    </motion.div>
                  )}
                  {gameState === "waiting" && (
                    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <Button onClick={startRound} className="w-full">
                        Start Round
                      </Button>
                    </motion.div>
                  )}
                  {gameState === "showing" && (
                    <motion.div
                      key="showing"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center"
                    >
                      <motion.div
                        className="w-32 h-32 mx-auto mb-4 rounded-full"
                        style={{ backgroundColor: targetColor }}
                        initial={{ rotate: 0 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 5, ease: "linear" }}
                      />
                      <p className="pt-6 pb-2">Remember this color!</p>
                      <ProgressBar duration={5000} />
                    </motion.div>
                  )}
                  {gameState === "picking" && (
                    <motion.div
                      key="picking"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -50 }}
                      className="text-center"
                    >
                      <p className="mb-4">Pick the color you remember</p>
                      <div className="flex justify-around">
                        <div>
                          <p>{player1Name}</p>
                          <ChromePicker color={player1Color} onChange={(color) => setPlayer1Color(color.hex)} />
                        </div>
                        <div>
                          <p>{player2Name}</p>
                          <ChromePicker color={player2Color} onChange={(color) => setPlayer2Color(color.hex)} />
                        </div>
                      </div>
                      <Button onClick={endRound} className="mt-4">
                        Submit Colors
                      </Button>
                    </motion.div>
                  )}
                  {gameState === "results" && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="text-center"
                    >
                      <div className="flex justify-around mb-6">
                        <ColorResult label="Target" color={targetColor} icon={Target} />
                        <ColorResult label={player1Name} color={player1Color} icon={User} />
                        <ColorResult label={player2Name} color={player2Color} icon={User} />
                      </div>
                      <div className="space-y-2 mb-4">
                        <motion.p
                          className="flex justify-center items-center gap-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <p className="font-semibold text-lg">{player1Name}</p>{" "}
                          <p className={`${player1RoundScore > 0 && "text-green-500 font-bold"}`}>
                            +{player1RoundScore}
                          </p>
                        </motion.p>
                        <motion.p
                          className="flex justify-center items-center gap-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          <p className="font-semibold text-lg">{player2Name}</p> +{player2RoundScore}
                        </motion.p>
                      </div>
                      <Button onClick={startRound} className="mt-4">
                        Next Round
                      </Button>
                    </motion.div>
                  )}
                </>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
      {!showNameInput && (
        <motion.div
          className="text-center mt-8 flex justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Total Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around items-center">
                <div className="text-center">
                  <p className="text-lg font-semibold">{player1Name}</p>
                  <p className="text-3xl font-bold text-primary">{player1Score}</p>
                </div>
                <div className="text-4xl font-bold text-muted-foreground">vs</div>
                <div className="text-center">
                  <p className="text-lg font-semibold">{player2Name}</p>
                  <p className="text-3xl font-bold text-primary">{player2Score}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
