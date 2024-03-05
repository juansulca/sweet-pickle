import { ReactP5Wrapper, Sketch } from "@p5-wrapper/react";
import { useCallback, useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "@radix-ui/react-label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { socket } from "@/lib/socket";
import { nanoid } from "nanoid";

const getColor = (color: string) => {
  if (color === "b") return "#222222";
  if (color === "r") return "#E50000";
  return "#FFFFFF";
};

const updateCanvas = async (update: {
  position: number;
  color: string;
  clientId: string;
}) => {
  return fetch("/api/updates", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
  });
};

const getCanvas = async (): Promise<string[]> => {
  const response = await fetch("/api/canvas", {
    method: "GET",
  });
  const { canvas } = await response.json();
  return canvas;
}

const clientId = nanoid();

export const Canvas = () => {
  const { data, isLoading, isSuccess } = useQuery({ queryKey: ['tiles'], queryFn: getCanvas });
  const [tiles, setTiles] = useState<string[]>([]);
  const [userColor, setUserColor] = useState("w");
  const mutation = useMutation({
    mutationFn: updateCanvas,
  });

  useEffect(() => {
    if (isSuccess) {
      setTiles(data);
    }
  }, [data, isSuccess]);

  const sketch: Sketch<{ userColor: string }> = useCallback(
    (p5) => {
      const stepSize = 4;
      let internalUserColor = "w";
      let t: string[] = [];

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

      const onClickTile =
        (left: number, top: number) => (event: { [x: string]: number }) => {
          const { x, y } = event;
          const position =
            p5.floor((x - left) / stepSize) +
            p5.floor((y - top) / stepSize) * 250;
          const color = internalUserColor;
          t[position] = color;
          // setTiles((tiles) => {
          //   const newTiles = [...tiles];
          //   newTiles[position] = color;
          //   return newTiles;
          // });
          mutation.mutate({ position, color, clientId });
        };

      p5.setup = () => {
        const canvas = p5.createCanvas(250 * stepSize, 122 * stepSize);
        const { left, top } = canvas.elt.getBoundingClientRect();
        canvas.mouseClicked(onClickTile(left, top));
        t = tiles;
      };

      p5.updateWithProps = (props: { userColor: string; tiles: string[] }) => {
        if (props.userColor) {
          internalUserColor = props.userColor;
        }
        if (props.tiles) {
          t = props.tiles;
        }
      };

      p5.draw = () => {
        p5.background(250);
        let cont = 1;
        let x = 0;
        let y = 0;
        for (const tile of t) {
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
    },
    [mutation, tiles]
  );

  useEffect(() => {
    console.log('creating sub', clientId);
    const channel = socket.subscribe("canvas");
    channel.bind(
      "update",
      (data: { position: number; color: string; clientId: string }) => {
        console.log("received", data);
        const { position, color, clientId: id } = data;
        if (id !== clientId) {
          setTiles((tiles) => {
            const newTiles = [...tiles];
            newTiles[position] = color;
            return newTiles;
          });
        }
      }
    );

    return () => {
      channel.unbind("canvas").unsubscribe();
    };
  }, []);

  return (
    <div className="mt-4">
      <div className="border">
        {isLoading ?
          <div>Loading...</div> :
          <ReactP5Wrapper sketch={sketch} userColor={userColor} tiles={tiles} />
        }
      </div>
      <div>
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
    </div>
  );
};
