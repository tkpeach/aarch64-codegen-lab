define i64 @logical(i64 %a, i64 %b) {
  %v = lshr i64 %b, 3
  %r = add i64 %a, %v
  ret i64 %r
}

define i64 @arithmetic(i64 %a, i64 %b) {
  %v = ashr i64 %b, 3
  %r = add i64 %a, %v
  ret i64 %r
}
