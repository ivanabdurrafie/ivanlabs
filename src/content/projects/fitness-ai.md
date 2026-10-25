---
title: Fitness AI Integration Service
type: Backend Service
stack: Golang
metric: 3x
metricLabel: Faster Processing
summary: Personal project exploring Golang backend architecture. Built a service orchestrating Strava API, LLM endpoints, and Telegram bot. Implemented concurrent request handling and caching strategies, achieving 3x faster processing compared to sequential API calls.
impact: Hands-on experience with Go concurrency patterns (goroutines, channels), API integration design, and building resilient external service orchestration.
tech: [Golang, REST APIs, LLM, Strava API, Telegram Bot]
icon: zap
order: 1
---

## The Problem

Fitness data lives across three unrelated systems: Strava holds the activity history, an LLM endpoint turns raw numbers into useful analysis, and Telegram delivers the result. Chaining them one after the next means every step waits for the previous one — the user waits for the network to agree with itself.

## The Approach

The service fans out independent external calls concurrently and coordinates them with goroutines and channels instead of a sequential loop. Responses that don't change between runs are cached, so repeated requests skip the expensive round-trips entirely. Failures in one upstream don't take the whole pipeline down — each integration degrades on its own.

## The Result

Processing came in **3x faster** than the sequential baseline. Beyond the number, the project was a practical grounding in Go's concurrency model: knowing when to fan out, when to wait, and how to keep an orchestrator honest when three third-party APIs are involved.
