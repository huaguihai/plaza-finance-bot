import winston from 'winston';

// 自定义时间戳格式
const customTimestampFormat = winston.format((info) => {
    const timestamp = new Date().toLocaleString();
    info.timestamp = `\x1b[36m${timestamp}\x1b[0m`;
    return info;
});

// 日志格式配置
const logFormat = winston.format.combine(
    customTimestampFormat(),
    winston.format.printf(({ timestamp, level, message }) => {
        if (message instanceof Error) {
            return `[${timestamp}] [${level}] ${message.stack || message.message}`;
        };
        const coloredLevel = winston.format.colorize().colorize(level, level.toUpperCase());
        return `[${timestamp}] [${coloredLevel}]: ${message}`;
    })
);

// 创建日志记录器
const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    transports: [
        new winston.transports.Console({
            level: 'info',
            format: logFormat
        }),
    ]
});

export default logger;
