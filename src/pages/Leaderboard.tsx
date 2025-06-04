import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageTitle from "@/components/PageTitle";

const Leaderboard = () => {
  const [activeFilter, setActiveFilter] = useState("week");
  const [mapFilter, setMapFilter] = useState("all");

  const maps = [
    { value: "all", label: "All Maps" },
    { value: "training", label: "Training Ground", order: 1 },
    { value: "municipal", label: "Municipal Maze", order: 2 },
    { value: "tax", label: "Tax Tower", order: 3 },
    { value: "permit", label: "Permit Palace", order: 4 },
    { value: "bureaucracy", label: "Bureaucracy Boss", order: 5 },
  ];

  const mockLeaderboardData = {
    week: [
      {
        rank: 1,
        name: "Entrepreneur Erik",
        score: 12500,
        mapReached: "Permit Palace",
      },
      { rank: 2, name: "Startup Siri", score: 11200, mapReached: "Tax Tower" },
      {
        rank: 3,
        name: "Business Bjørn",
        score: 10800,
        mapReached: "Tax Tower",
      },
      {
        rank: 4,
        name: "Venture Vilde",
        score: 9500,
        mapReached: "Municipal Maze",
      },
      {
        rank: 5,
        name: "Innovation Ingrid",
        score: 8900,
        mapReached: "Municipal Maze",
      },
    ],
    month: [
      {
        rank: 1,
        name: "Startup Siri",
        score: 45600,
        mapReached: "Bureaucracy Boss",
      },
      {
        rank: 2,
        name: "Entrepreneur Erik",
        score: 43200,
        mapReached: "Permit Palace",
      },
      {
        rank: 3,
        name: "Business Bjørn",
        score: 39800,
        mapReached: "Permit Palace",
      },
      {
        rank: 4,
        name: "Innovation Ingrid",
        score: 35400,
        mapReached: "Tax Tower",
      },
      { rank: 5, name: "Venture Vilde", score: 32100, mapReached: "Tax Tower" },
    ],
    year: [
      {
        rank: 1,
        name: "Innovation Ingrid",
        score: 156800,
        mapReached: "Bureaucracy Boss",
      },
      {
        rank: 2,
        name: "Startup Siri",
        score: 142300,
        mapReached: "Bureaucracy Boss",
      },
      {
        rank: 3,
        name: "Entrepreneur Erik",
        score: 138900,
        mapReached: "Bureaucracy Boss",
      },
      {
        rank: 4,
        name: "Business Bjørn",
        score: 125600,
        mapReached: "Permit Palace",
      },
      {
        rank: 5,
        name: "Venture Vilde",
        score: 119400,
        mapReached: "Permit Palace",
      },
    ],
  };

  const filters = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "year", label: "This Year" },
  ];

  const getMapOrder = (mapName: string) => {
    return maps.find((m) => m.label === mapName)?.order || 0;
  };

  const baseData =
    mockLeaderboardData[activeFilter as keyof typeof mockLeaderboardData];

  // Sort by map order (highest first), then by score (highest first)
  const sortedData = [...baseData].sort((a, b) => {
    const mapOrderA = getMapOrder(a.mapReached);
    const mapOrderB = getMapOrder(b.mapReached);

    if (mapOrderA !== mapOrderB) {
      return mapOrderB - mapOrderA; // Higher map order first
    }
    return b.score - a.score; // Higher score first within same map
  });

  // Apply map filter and reassign ranks
  const filteredData =
    mapFilter === "all"
      ? sortedData
      : sortedData.filter((entry) => {
          const mapValue = maps.find((m) => m.label === entry.mapReached)
            ?.value;
          return mapValue === mapFilter;
        });

  const currentData = filteredData.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  return (
    <div>
      <PageTitle
        title="Toppliste"
        subtitle="Gründere som overlevde det norske byråkratiet"
      />
      <div className="mb-8">
        <img
          src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=1200&h=300&fit=crop"
          alt="Leaderboard champions"
          className="w-full h-48 rounded-xl object-cover shadow-2xl border border-border"
        />
      </div>

      <Card className="bg-card/40 backdrop-blur-sm border-border">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <CardTitle className="text-foreground text-2xl">
              Hall of Fame
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex space-x-2">
                {filters.map((filter) => (
                  <Button
                    key={filter.key}
                    variant={
                      activeFilter === filter.key ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setActiveFilter(filter.key)}
                    className={
                      activeFilter === filter.key
                        ? "bg-accent hover:bg-accent/90"
                        : ""
                    }
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              <Select value={mapFilter} onValueChange={setMapFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by map" />
                </SelectTrigger>
                <SelectContent>
                  {maps.map((map) => (
                    <SelectItem key={map.value} value={map.value}>
                      {map.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-muted-foreground">Rank</TableHead>
                <TableHead className="text-muted-foreground">
                  Entrepreneur
                </TableHead>
                <TableHead className="text-muted-foreground">Score</TableHead>
                <TableHead className="text-muted-foreground">
                  Map Reached
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentData.map((entry) => (
                <TableRow
                  key={entry.rank}
                  className="border-border hover:bg-muted/50"
                >
                  <TableCell className="text-foreground font-bold">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          entry.rank === 1
                            ? "bg-primary text-primary-foreground"
                            : entry.rank === 2
                            ? "bg-muted text-muted-foreground"
                            : entry.rank === 3
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {entry.rank}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground font-medium">
                    {entry.name}
                  </TableCell>
                  <TableCell className="text-accent font-bold">
                    {entry.score.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-primary font-medium">
                    {entry.mapReached}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-center mt-8 mb-12 md:mb-0">
        <p className="text-muted-foreground text-sm">
          Think you can beat these scores? Help Sigurd reach new heights!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
