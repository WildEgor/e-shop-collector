CREATE TABLE IF NOT EXISTS gs_db.topic_feedbacks
(
    id String,
    t_id Int64, --  topic id
    s_tid Int64, -- support telegram id
    s_tun String DEFAULT NULL, -- support telegram username
    s_uid String DEFAULT NULL, -- support auth id
    u_tid Int64, -- user telegram id
    u_tun String DEFAULT NULL, -- support telegram username
    rating UInt8,
    event_date Date DEFAULT now(),
    event_date_time DateTime DEFAULT now()
)
ENGINE = MergeTree
ORDER BY (t_id, s_tid, event_date)
PARTITION BY toYYYYMM(event_date)
SETTINGS index_granularity = 8192;