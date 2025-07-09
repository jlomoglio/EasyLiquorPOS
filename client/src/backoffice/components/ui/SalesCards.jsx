import { Card, Text, Group, Grid } from "@mantine/core";

export default function SalesCards() {
    const salesData = [
        { title: "Total Sales", total: "$15,000.87", cash: "$7,500.87", credit: "$6,500.23", transactions: 440 },
        { title: "Today", total: "$1,500.87", cash: "$1,000.87", credit: "$500.23", transactions: 40 },
        { title: "This Month", total: "$15,000.87", cash: "$10,000.87", credit: "$5,000.23", transactions: 300 },
    ];

    return (
        <Grid grow gutter="md" className="mt-[20px]">
            {salesData.map((data, index) => (
                <Grid.Col span={4} key={index}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Text weight={700} size="lg" mb="xs">{data.title}</Text>
                        <Group position="apart">
                            <Text>Total</Text> <Text weight={500}>{data.total}</Text>
                        </Group>
                        <Group position="apart">
                            <Text>Cash</Text> <Text weight={500}>{data.cash}</Text>
                        </Group>
                        <Group position="apart">
                            <Text>Credit</Text> <Text weight={500}>{data.credit}</Text>
                        </Group>
                        <Group position="apart">
                            <Text>Transactions</Text> <Text weight={500}>{data.transactions}</Text>
                        </Group>
                    </Card>
                </Grid.Col>
            ))}
        </Grid>
    );
}



