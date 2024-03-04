import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function Menu() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Sweet Pickle</CardTitle>
        <CardDescription>Insert device Id</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="id">Id</Label>
              <Input id="id" placeholder="Id of your device" />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Canvas</Button>
        <Button>Configure</Button>
      </CardFooter>
    </Card>
  )
}

