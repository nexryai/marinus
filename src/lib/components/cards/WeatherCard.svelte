<script lang="ts">
    import { onMount } from "svelte";

    import { Skeleton } from "$lib/components/ui/skeleton";

    const API_URL = "https://workers-weather-api.nexryai.workers.dev/weather";

    interface WeatherForecast {
        now_temp: number;
        today_weather_symbol: string;
        forecasts: Weather[];
    }

    interface Weather {
        date: string;
        symbol: string;
        max_temp: number;
        min_temp: number;
    }

    let isLoading = $state(true);
    let weather: WeatherForecast | null = $state(null);
    let error: string | null = $state(null);

    const fetchWeather = async (lat?: number, lon?: number): Promise<WeatherForecast> => {
        let url = API_URL;
        if (lat && lon) {
            url += `?lat=${lat}&lon=${lon}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
            throw new Error("Failed to fetch weather");
        }

        return await res.json();
    };

    const weatherDetails = (weather: WeatherForecast) => {
        const s = weather.today_weather_symbol;

        // Dynamic Weather Color Technology™︎
        let backgroundGradient = "linear-gradient(320deg, rgb(149, 149, 149), rgb(213, 213, 213))";
        let textColor = "black";
        let objFilter = "blur(8px) opacity(0.75)";

        if (s.includes("night")) {
            if (s === "clearsky_night") {
                backgroundGradient = "linear-gradient(320deg, rgb(0, 25, 102), rgb(0, 10, 68))";
                objFilter = "blur(12px) brightness(4)";
            } else if (s === "partlycloudy_night" || s === "lightrainshowers_night") {
                backgroundGradient = "linear-gradient(320deg, rgb(113, 113, 113), rgb(21, 21, 21))";
                objFilter = "blur(16px)";
            } else {
                backgroundGradient = "linear-gradient(320deg, rgb(113, 113, 113), rgb(21, 21, 21))";
                objFilter = "blur(6px) brightness(2) opacity(0.8)";
            }

            textColor = "white";
        } else if (s.startsWith("clearsky_") || s.startsWith("fair_")) {
            backgroundGradient = "linear-gradient(320deg, #FFEFDF, #DCEAFF)";
            objFilter = "blur(16px) opacity(0.85)";
        } else if (s.startsWith("partlycloudy_")) {
            backgroundGradient = "linear-gradient(320deg, rgb(244, 244, 244), rgb(171, 196, 230))";
            objFilter = "blur(16px)";
        } else if (s.includes("rain") && (s.endsWith("_day") || s.endsWith("_polartwilight"))) {
            backgroundGradient = "linear-gradient(20deg, rgb(149, 149, 149), rgb(213, 213, 213))";
            objFilter = "blur(16px) opacity(0.75) contrast(0)";
        }

        return { backgroundGradient, textColor, objFilter };
    };

    onMount(async () => {
        try {
            weather = await fetchWeather();
        } catch (e) {
            // @ts-ignore
            error = e.message;
        } finally {
            isLoading = false;
        }
    });
</script>

{#if error}
    <p class="hidden">{error}</p>
{:else if isLoading}
    <div class="h-[164px] w-full p-6">
        <Skeleton class="h-6 w-24" />
        <div class="mt-7 grid grid-cols-2 gap-8">
            <div>
                <Skeleton class="h-4 w-24" />
                <Skeleton class="mt-3 h-4 w-36" />
            </div>
            <div >
                <Skeleton class="h-4 w-24" />
                <Skeleton class="mt-3 h-4 w-36" />
            </div>
        </div>
    </div>
{:else if weather}
    <div>
        <div
            class="p-6"
            style="background: {weatherDetails(weather).backgroundGradient}; color: {weatherDetails(weather).textColor};"
        >
            <div class="flex">
                <img alt={`Weather icon of ${weather.today_weather_symbol}`} class="w-8 h-8 mr-2" src={`https://weathericons.pages.dev/dist/v2/${weather.today_weather_symbol}.svg`} />
                <p class="text-xl">{weather.now_temp}°C</p>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-8">
                {#each weather.forecasts as f (f.date)}
                    <div class="mb-3">
                        <p class="text-base">{f.date}</p>
                        <div class="flex justify-between">
                            <img alt={`Weather icon of ${f.symbol}`} src={`https://weathericons.pages.dev/dist/v2/${f.symbol}.svg`} class="w-8 h-8 mr-1" />
                            <p class="text-sm pt-1.5">
                                <span>{f.max_temp}°C</span> /
                                <span>{f.min_temp}°C</span>
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}
