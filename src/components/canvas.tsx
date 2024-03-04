import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "@radix-ui/react-label";
import { useMutation } from "@tanstack/react-query";
import { socket } from "@/lib/socket";

const initialTiles = new Array(250 * 122).fill("r");

const getColor = (color: string) => {
  if (color === "b") return "#222222";
  if (color === "r") return "#E50000";
  return "#FFFFFF";
};

export const Canvas = () => {
  const [tiles, setTiles] = useState(initialTiles);
  const [userColor, setUserColor] = useState("w");
  const mutation = useMutation({
    mutationFn: async (update: {position: number, color: string}) => {
      fetch("/api/updates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      });
    },
  });

  const sketch: Sketch<{ userColor: string }> = (p5) => {
    const stepSize = 4;
    let internalUserColor = "w";
    const drawSquare = (x: number, y: number, color: string) => {
      p5.noStroke();
      p5.fill(color);
      p5.square(x, y, stepSize);
    };

    const renderSelector = () => {
      const xposition = p5.floor(p5.mouseX / stepSize) * stepSize;
      const yposition = p5.floor(p5.mouseY / stepSize) * stepSize;
      p5.strokeWeight(2);
      p5.stroke(70);
      p5.noFill();
      p5.square(xposition, yposition, stepSize);
    };

    const onClickTile = (left: number, top: number) => (event: {[x: string]: number}) => {
      const { x, y } = event;
      const position =
        p5.floor((x - left) / stepSize) + p5.floor((y - top) / stepSize) * 250;
      const color = internalUserColor;
      setTiles((tiles) => {
        const newTiles = [...tiles];
        newTiles[position] = color;
        return newTiles;
      });
      mutation.mutate({position, color});
    };

    p5.setup = () => {
      const canvas = p5.createCanvas(250 * stepSize, 122 * stepSize);
      const { left, top } = canvas.elt.getBoundingClientRect();
      canvas.mouseClicked(onClickTile(left, top));
    };

    p5.updateWithProps = (props: {userColor: string}) => {
      if (props.userColor) {
        internalUserColor = props.userColor;
      }
    };

    p5.draw = () => {
      p5.background(250);
      let cont = 1;
      let x = 0;
      let y = 0;
      for (const tile of tiles) {
        drawSquare(x, y, getColor(tile));
        x += stepSize;
        if (cont % 250 == 0) {
          x = 0;
          y += stepSize;
        }
        cont += 1;
      }
      renderSelector();
    };
  };

  useEffect(() => {
    const channel = socket.subscribe('canvas');
    channel.bind("update", (data: {position: number, color: string}) => {
      console.log("received", data);
      setTiles((tiles) => {
        const newTiles = [...tiles];
        newTiles[data.position] = data.color;
        return newTiles;
      });
    });

    return () => {
      channel.unbind('canvas')
    };
  }, []);

  return (
    <div className="mt-4">
      <ReactP5Wrapper sketch={sketch} userColor={userColor} />
      <RadioGroup
        defaultValue="w"
        orientation="horizontal"
        onValueChange={(c) => setUserColor(c)}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="w" id="w" />
          <Label htmlFor="w">White</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="b" id="b" />
          <Label htmlFor="b">Black</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="r" id="r" />
          <Label htmlFor="r">Red</Label>
        </div>
      </RadioGroup>
    </div>
  );
};
